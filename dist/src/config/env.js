import dotenv from 'dotenv';
import path from 'path';
// .env ফাইলটি প্রজেক্টের রুট ডিরেক্টরি থেকে লোড করা হচ্ছে
dotenv.config({ path: path.join(process.cwd(), '.env') });
// ২. ইন্টারফেস অনুযায়ী কনফিগ অবজেক্ট তৈরি করা
const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000',
    DATABASE_URL: process.env.DATABASE_URL,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN || '7d',
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE || '24h',
    EMAIL_SENDER: {
        SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || '465',
        SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
        SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
        SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM,
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    },
    STRIPE: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    },
};
export default config;
