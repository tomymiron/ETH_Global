//# -- API END POINTS ROUTES -- //
import eventsRoutes from "./routes/events.js";
import authRoutes from "./routes/auth.js";
import paymentsRoutes from "./routes/payments.js";

//# -- IMPORTS -- //
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

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
app.use("/events", eventsRoutes);
app.use("/auth", authRoutes);
app.use("/payments", paymentsRoutes);

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