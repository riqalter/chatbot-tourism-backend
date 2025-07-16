import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY belum diatur di .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: 'Pesan kosong.' });
  let systemInstruction = '';
  try {
    // Baca instruksi dari file instruksi.txt (atau file lain sesuai kebutuhan)
    systemInstruction = fs.readFileSync('../instruksi.txt', 'utf8');
  } catch (e) {
    systemInstruction = 'Anda adalah asisten AI untuk layanan informasi perusahaan.';
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction,
        temperature: 0.2
      },
    });
    // Ambil hasil teks dari response
    const reply = response.text || 'Maaf, tidak ada jawaban.';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Terjadi kesalahan pada AI.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
