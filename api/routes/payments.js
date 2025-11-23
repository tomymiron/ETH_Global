import { handlePaymentWebhook, getPaymentStatus } from "../controllers/payments.js";
import express from "express";

const router = express.Router();

//* ---###--- Payment Webhooks ---###---

//# --- POST:PAYMENTS_WEBHOOK | Yellow Payment Webhook --- ?//
//+ AUTH: OFF (webhook endpoint - public)
// Route: /payments/webhook
router.post("/webhook", handlePaymentWebhook);

//* ---###--- Payment Queries ---###---

//# --- GET:PAYMENTS_STATUS | Get Payment Status --- ?//
//+ AUTH: ON-OFF (optional)
// Route: /payments/status?txId=...
router.get("/status", getPaymentStatus);

export default router;

