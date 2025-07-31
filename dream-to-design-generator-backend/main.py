from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
from typing import List
import torch
import uuid
import os

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

chat_context: List[str] = []
MAX_CONTEXT = 5

@app.post("/generate-image")

async def generate_image(request: PromptRequest):
  global chat_context

  chat_context.append(request.prompt)
  chat_context = chat_context[-MAX_CONTEXT:]

  full_prompt = " ".join(chat_context)

  image = pipe(full_prompt).images[0]

  os.makedirs("static", exist_ok=True)
  filename = f"{uuid.uuid4().hex}.png"
  image_path = f"static/{filename}"
  image.save(image_path)

  return {
    "url": f"http://localhost:8000/{image_path}",
    "context_used": full_prompt,
    "recent_prompts": chat_context,
  }

@app.post("/clear-context")
async def clear_context():
  chat_context.clear()
  return {"message": "Chat context cleared"}
