import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Box, TextField, Button, Snackbar, Alert, Skeleton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [open, setOpen] = React.useState(false);
  const [generatedResponses, setGeneratedResponses] = useState([]);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const generateImage = async () => {
    if (!prompt) return;

    const itemId = uuidv4();
    const newItem = { id: itemId, prompt, imageUrl: null };
    setGeneratedResponses((prev) => [newItem, ...prev]);

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:8000/generate-image", {
        prompt,
      });

      const imageUrlFromBackend = res.data.url;
      setGeneratedResponses((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, imageUrl: imageUrlFromBackend } : item
        )
      );
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
      setPrompt("");
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

          <div style={{ marginTop: "30px" }}>
            {generatedResponses.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#282c34",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    color: "#ccc",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    textAlign: "left"
                  }}
                >
                  {item.prompt}
                </p>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt="Generated"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                ) : (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={300}
                    animation="wave"
                    sx={{ borderRadius: "8px", bgcolor: 'grey.800' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Box>
    </div>
  );
}

export default App;
