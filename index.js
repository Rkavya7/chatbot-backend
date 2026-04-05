const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", (req, res) => {
  const userMessage = req.body.message;

  const reply = "Hello! You said: " + userMessage;

  res.json({ reply });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});