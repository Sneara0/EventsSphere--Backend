// 📂 src/app.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './app/routes/index.js'; 
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import notFound from './app/middlewares/notFound.js';
import { toNodeHandler } from "better-auth/node";
import { PaymentController } from './app/modules/payment/payment.controller.js';
import auth from './app/lib/auth.js';

const app: Application = express();

// --- ১. মিডলওয়্যার কনফিগারেশন (CORS) ---
const allowedOrigins = [
  "http://localhost:3000", 
  "https://eventspehere-frontend.vercel.app",
  // আপনার বর্তমান ভার্সেল প্রিভিউ লিঙ্কটিও যোগ করে দিচ্ছি যাতে এরর না আসে
  "https://eventspehere-frontend-54isxxop6.vercel.app" 
];

app.use(cors({
  origin: (origin, callback) => {
    // ডোমেইন চেক: লিস্টে থাকলে অথবা .vercel.app দিয়ে শেষ হলে অনুমতি দাও
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

// --- ২. STRIPE WEBHOOK (JSON parsing এর আগে থাকতে হবে) ---
app.post(
  "/api/v1/payments/webhook", 
  express.raw({ type: "application/json" }), 
  PaymentController.handleStripeWebhook 
);

// --- ৩. বডি পার্সার ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ৪. হেলথ চেক রুট ---
app.get('/', (req: Request, res: Response) => {
  res.send({ 
    success: true, 
    message: 'EventSphere Server is running perfectly! 🚀' 
  });
});

// --- ৫. আপনার মেইন এপিআই রাউটস (প্রথমে রাখা হলো) ---
app.use('/api/v1', IndexRoutes); 

// --- ৬. BETTER-AUTH হ্যান্ডলার (মেইন রাউটের পরে) ---
// /* যোগ করা হয়েছে যাতে সাব-রাউটগুলো (get-session, login) কাজ করে
app.all(/\/api\/v1\/auth($|\/.*)/, (req, res) => {
    return toNodeHandler(auth)(req, res);
});
// --- ৭. এরর হ্যান্ডলিং মিডলওয়্যার ---
app.use(globalErrorHandler);
app.use(notFound);

export default app;