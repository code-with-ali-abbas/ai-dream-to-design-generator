import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Snackbar, Alert } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [open, setOpen] = React.useState(false);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const generateImage = async () => {
    setLoading(true);
    setImageUrl("");
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8000/generate-image", {
        prompt,
      });

      const imageUrlFromBackend = res.data.url;
      setImageUrl(imageUrlFromBackend);
      setSeverity("success");
      setMessage("Image generated successfully!");
      setOpen(true);
    } catch (err) {
      console.error("Error generating image:", err);
      setSeverity("error");
      setMessage("Failed to generate image.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const clearContext = async () => {
    try {
      const res = await axios.post("http://localhost:8000/clear-context");
      setSeverity("success");
      setMessage(res.data.message || "Context cleared!");
      setOpen(true);
    } catch (err) {
      console.error("Error clearing context:", err);
      setSeverity("error");
      setMessage("Failed to clear context.");
      setOpen(true);
    }
  };

  return (
    <div className="App">
      <Box sx={{ width: "50%" }}>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        </Snackbar>
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
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <Button
              variant="outlined"
              endIcon={<DeleteIcon />}
              onClick={clearContext}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "#f00",
                  color: "#f00",
                },
              }}
            >
              Clear Context
            </Button>

            <Button
              variant="outlined"
              endIcon={<SendIcon />}
              onClick={generateImage}
              disabled={!prompt || loading}
              sx={{
                borderColor: "blue",
                color: "white",
                "&.Mui-disabled": {
                  borderColor: "#4d4df0",
                  color: "#4d4df0",
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
