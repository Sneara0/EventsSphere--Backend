import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './app/routes'; // আপনার কাস্টম রাউটস
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { toNodeHandler } from "better-auth/node";
import { auth } from './app/lib/auth';

const app: Application = express();

// --- ১. মিডলওয়্যার কনফিগারেশন ---
app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(cookieParser());

// --- ২. STRIPE WEBHOOK (বডি পার্সারের আগে থাকতে হবে) ---
app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), (req, res) => {
    res.status(200).send({ received: true });
});

// --- ৩. বডি পার্সার ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ৪. মেইন এপিআই রাউটস (এটিকে উপরে নিয়ে আসা হয়েছে) ---
/**
 * গুরুত্বপুর্ণ: আপনার কাস্টম /register বা অন্য রাউটগুলো Better-Auth এর আগে থাকতে হবে।
 * যাতে এক্সপ্রেস প্রথমে আপনার কাস্টম রাউট খুঁজে পায়।
 */
app.use('/api/v1', IndexRoutes); 

// --- ৫. BETTER-AUTH ইন্টারনাল হ্যান্ডলার (FIXED) ---
/**
 * যদি /api/v1/auth/register আপনার কাস্টম রাউটে না মেলে, 
 * কেবল তখনই সেটি Better-Auth হ্যান্ডলারে যাবে।
 */
app.use("/api/v1/auth", (req, res) => {
    return toNodeHandler(auth)(req, res);
});

// হেলথ চেক রুট
app.get('/', (req: Request, res: Response) => {
  res.send({ 
    success: true, 
    message: 'EventSphere Server is synchronized and running perfectly! 🚀' 
  });
});

// --- ৬. এরর হ্যান্ডলিং মিডলওয়্যার ---
app.use(globalErrorHandler);
app.use(notFound);

export default app;