import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImageUrl("");

    try {
      const res = await axios.post("http://localhost:8000/generate-image", {
        prompt,
      });

      const imageUrlFromBackend = res.data.url;
      setImageUrl(imageUrlFromBackend);
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Box sx={{ width: "50%" }}>
        <div className="">
          <h1 style={{ color: "white" }}>Dream-to-Design Generator</h1>
          <TextField
            id="outlined-multiline-flexible"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            multiline
            maxRows={4}
            autoFocus
            placeholder="Describe your dream design..."
            sx={{
              width: "100% !important",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#303030 !important",
                padding: "0px !important",
                color: "white",
              },
              "& .MuiInputBase-inputMultiline": {
                padding: "10.5px !important",
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={generateImage}
              disabled={!prompt || loading}
              loading={loading}
              loadingPosition="end"
              sx={{
                backgroundColor: "blue",
                color: "white",
                "&.Mui-disabled": {
                  backgroundColor: "#4d4df0",
                  color: "white",
                },
              }}
            >
              {loading ? "Generating..." : "Generate"}
            </Button>
          </Box>

          {imageUrl && (
            <div>
              <h2 style={{ color: "white" }}>
                Here are the visuals of your dream
              </h2>
              <img src={imageUrl} alt="Generated" />
            </div>
          )}
        </div>
      </Box>
    </div>
  );
}

export default App;
