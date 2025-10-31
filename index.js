import express from "express";
import fetch from "node-fetch";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "*" })); // Bisa diganti dengan domain frontend saja

// ===== Rate limiter supaya aman =====
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 150,                 // max 150 request per IP
});
app.use(limiter);

// ===== OpenRouter API key =====
// JANGAN taruh langsung di sini! Pakai Environment Variable
// Saat deploy di Render, tambahkan Environment Variable:
// Name: OPENROUTER_API_KEY
// Value: <API_KEY_OPENROUTER_MU>
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_KEY) {
  console.error("⚠️ SET OPENROUTER_API_KEY sebagai Environment Variable!");
  process.exit(1);
}

// ===== Endpoint chat =====
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages required" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: model || "gemini-2.5",
        messages,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error", detail: e.message });
  }
});

// ===== Jalankan server =====
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));