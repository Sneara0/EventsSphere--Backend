import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { toNodeHandler } from "better-auth/node";
import { auth } from './app/lib/auth';

const app: Application = express();

// --- ১. মিডলওয়্যার কনফিগারেশন ---
app.use(cors({
    origin: ["http://localhost:3000"], // আপনার ফ্রন্টএন্ড ইউআরএল
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

// --- ২. STRIPE WEBHOOK ---
// (বডি পার্সারের উপরে থাকতে হবে কারণ এটি Raw Body চায়)
app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), (req, res) => {
    // এখানে আপনার ওয়েবহুক হ্যান্ডলার লজিক বসবে
    res.status(200).send({ received: true });
});

// --- ৩. বডি পার্সার ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ৪. মেইন এপিআই রাউটস (IndexRoutes) ---
/**
 * আপনার কাস্টম /register, /login রাউটগুলো এর ভেতরে আছে।
 * এটি আগে রাখলে Better-Auth এর সাথে সংঘর্ষ হবে না।
 */
app.use('/api/v1', IndexRoutes);

// --- ৫. BETTER-AUTH ইন্টারনাল হ্যান্ডলার (FIXED for Node v24) ---
/**
 * path-to-regexp v7+ এ ওয়াইল্ডকার্ডের জন্য শুধু '*' ব্যবহার করা যায় না।
 * এখানে '/api/v1/auth' এর পর সরাসরি মিডলওয়্যার হিসেবে Better-Auth কে দেওয়া হয়েছে।
 * এটি অটোমেটিক সব সাব-পাথ (যেমন: /session, /callback/google) হ্যান্ডেল করবে।
 */
app.use("/api/v1/auth", (req, res) => {
    const handler = toNodeHandler(auth);
    return handler(req, res);
});

// হেলথ চেক রুট
app.get('/', (req: Request, res: Response) => {
  res.send({ 
    success: true, 
    message: 'EventSphere Server is synchronized and running perfectly! 🚀' 
  });
});

// --- ৬. এরর হ্যান্ডলিং মিডলওয়্যার ---
// (সবার শেষে থাকবে)
app.use(globalErrorHandler);
app.use(notFound);

export default app;