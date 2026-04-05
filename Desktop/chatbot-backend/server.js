require("dotenv").config();
const express = require("express");
const cors = require("cors");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// API KEY from .env
const apiKey = process.env.API_KEY;

console.log("API KEY:", apiKey);

// Gemini model
const MODEL_NAME = "models/gemini-2.5-flash";

// Chat API
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("API RESPONSE:", JSON.stringify(data, null, 2));

    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    res.json({ reply: botReply });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ reply: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});