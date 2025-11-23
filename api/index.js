//# -- API END POINTS ROUTES -- //
import authRoutes from "./routes/auth.js";

//# -- IMPORTS -- //
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import sharp from "sharp";
import cors from "cors";
import path from "path";

dotenv.config();
const app = express();

//# -- DIRECTORY ROUTE -- //
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//# -- Middlewares -- //
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      if (!buf || buf.length === 0) return;
      JSON.parse(buf);
    } catch (e) {
      console.log('JSON Parse Error:', e.message);
      console.log('Request URL:', req.url);
      console.log('Request Method:', req.method);
      console.log('Raw body:', buf.toString());
      res.status(400).json({ error: 'Invalid JSON format' });
      throw e;
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: [process.env.CORS_ORIGIN].filter(Boolean),
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

//# -- Main Routes -- //
app.use("/auth", authRoutes);

//# -- Image Routes -- //
app.get('/image/profile/:name', (req, res) => {
  const imagePath = `./images/profile_images/${req.params.name}`;
  sharp(imagePath)
    .resize(360, 360)
    .toBuffer()
    .then((data) => { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); res.end(data) })
    .catch((error) => { res.status(500).send('Error al procesar la imagen') });
});

app.use("/", (req, res) => {
  res.status(200).send("<h1>Welcome to the NEW PREVIATE API</h1>");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting Previate API:", err);
  } else {
    console.log("Previate API working on port", PORT);
  }
});