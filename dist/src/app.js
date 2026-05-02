import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './app/routes/index.js';
import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import notFound from './app/middlewares/notFound.js';
import { toNodeHandler } from "better-auth/node";
import { PaymentController } from './app/modules/payment/payment.controller.js';
import auth from './app/lib/auth.js';
const app = express();
// --- ১. মিডলওয়্যার কনফিগারেশন (CORS) ---
const allowedOrigins = [
    "http://localhost:3000",
    "https://eventspehere-frontend.vercel.app",
    "https://eventspehere-frontend-54isxxop6.vercel.app"
];
app.use(cors({
    origin: (origin, callback) => {
        // ডোমেইন চেক: লিস্টে থাকলে অথবা .vercel.app দিয়ে শেষ হলে অনুমতি দাও
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // মোবাইলে সেশন কুকি পাস করার জন্য এটি মাস্ট
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // 📱 মোবাইলের সেশন প্রবলেম ফিক্স করার জন্য Cookie এবং exposedHeaders রাখা হয়েছে
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"]
}));
app.use(cookieParser());
// --- ২. STRIPE WEBHOOK (JSON parsing এর আগে থাকতে হবে) ---
app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhook);
// --- ৩. বডি পার্সার ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- ৪. হেলথ চেক রুট ---
app.get('/', (req, res) => {
    res.send({
        success: true,
        message: 'EventSphere Server is running perfectly! 🚀'
    });
});
// --- ৫. আপনার মেইন এপিআই রাউটস (প্রথমে রাখা হলো) ---
app.use('/api/v1', IndexRoutes);
// --- ৬. BETTER-AUTH হ্যান্ডলার ---
// আপনার দেওয়া Regex পাথটিই রাখা হলো
app.all(/\/api\/v1\/auth($|\/.*)/, (req, res) => {
    return toNodeHandler(auth)(req, res);
});
// --- ৭. এরর হ্যান্ডলিং মিডলওয়্যার ---
app.use(globalErrorHandler);
app.use(notFound);
export default app;
