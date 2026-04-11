// 📂 src/app.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// './app/routes' এর বদলে পুরো পাথ './app/routes/index' দিন
import { IndexRoutes } from './app/routes/index.js'; 
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import notFound from './app/middlewares/notFound.js';
import { toNodeHandler } from "better-auth/node";

import { PaymentController } from './app/modules/payment/payment.controller.js';
import auth from './app/lib/auth.js';

const app: Application = express();

// --- ১. মিডলওয়্যার কনফিগারেশন ---
app.use(cors({
    // প্রোডাকশনে আপনার ফ্রন্টএন্ড লিঙ্কটিও এখানে যোগ করতে হবে
    origin: ["http://localhost:3000"], 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "Cookie", 
        "X-Requested-With",
        "Accept"
    ],
    exposedHeaders: ["set-cookie"]
}));

app.use(cookieParser());

// --- ২. STRIPE WEBHOOK ---
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
    message: 'EventSphere Server is synchronized and running perfectly! 🚀' 
  });
});

// --- ৫. মেইন এপিআই রাউটস ---
app.use('/api/v1', IndexRoutes); 

// --- ৬. BETTER-AUTH হ্যান্ডলার ---
app.all("/api/v1/auth", (req, res) => { // এখানে '*' যোগ করা হয়েছে সব সাব-রাউট ধরার জন্য
    return toNodeHandler(auth)(req, res);
});

// --- ৭. এরর হ্যান্ডলিং মিডলওয়্যার ---
app.use(globalErrorHandler);
app.use(notFound);

export default app;