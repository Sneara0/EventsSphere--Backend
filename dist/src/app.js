// 📂 src/app.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IndexRoutes } from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { toNodeHandler } from "better-auth/node";
import { auth } from './app/lib/auth';
import { PaymentController } from './app/modules/payment/payment.controller'; // কন্ট্রোলার ইম্পোর্ট করুন
const app = express();
// --- ১. মিডলওয়্যার কনফিগারেশন ---
app.use(cors({
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
// --- ২. STRIPE WEBHOOK (বডি পার্সারের আগে এবং কন্ট্রোলার সহ) ---
// গুরুত্বপূর্ণ: এখানে অবশ্যই PaymentController.handleStripeWebhook থাকতে হবে
app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhook);
// --- ৩. বডি পার্সার (ওয়েবহুক রাউটের পরে) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- ৪. হেলথ চেক রুট ---
app.get('/', (req, res) => {
    res.send({
        success: true,
        message: 'EventSphere Server is synchronized and running perfectly! 🚀'
    });
});
// --- ৫. মেইন এপিআই রাউটস ---
app.use('/api/v1', IndexRoutes);
// --- ৬. BETTER-AUTH হ্যান্ডলার ---
// নোট: সব সাব-রাউট ধরার জন্য '/api/v1/auth/*' ব্যবহার করা নিরাপদ
app.all("/api/v1/auth", (req, res) => {
    return toNodeHandler(auth)(req, res);
});
// --- ৭. এরর হ্যান্ডলিং মিডলওয়্যার ---
app.use(globalErrorHandler);
app.use(notFound);
export default app;
