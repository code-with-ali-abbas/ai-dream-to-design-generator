from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
from typing import List
import torch
import uuid
import os

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
  prompt: str

device = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch_dtype
)

pipe = pipe.to(device)

MAX_CONTEXT = 5
client = chromadb.Client()
embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
collection = client.get_or_create_collection(name="dream_to_design_chat_context", embedding_function=embedding_fn)

@app.post("/generate-image")

async def generate_image(request: PromptRequest):
  collection.add(documents=[request.prompt], ids=[str(uuid.uuid4())])

  results = collection.query(
    query_texts=[request.prompt],
    n_results=MAX_CONTEXT
  )

  recent_prompts = results["documents"][0] if results["documents"] else []
  full_prompt = " ".join(recent_prompts)

  image = pipe(full_prompt).images[0]

  os.makedirs("static", exist_ok=True)
  filename = f"{uuid.uuid4().hex}.png"
  image_path = f"static/{filename}"
  image.save(image_path)

  return {
    "url": f"http://localhost:8000/{image_path}",
    "context_used": full_prompt,
    "recent_prompts": recent_prompts,
  }

@app.post("/clear-context")
async def clear_context():
  client.delete_collection("dream_to_design_chat_context")
  client.get_or_create_collection(name="dream_to_design_chat_context", embedding_function=embedding_fn)
  return {"message": "Chat context cleared"}
