import dotenv from 'dotenv';
import path from 'path';

// .env ফাইলটি প্রজেক্টের রুট ডিরেক্টরি থেকে লোড করা হচ্ছে
dotenv.config({ path: path.join(process.cwd(), '.env') });

// ১. আগে ইন্টারফেসটি ডিফাইন করতে হবে
export interface EnvConfig {
    NODE_ENV: string;
    PORT: string; 
    DATABASE_URL: string;
    SUPER_ADMIN_EMAIL: string;
    SUPER_ADMIN_PASSWORD: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
    EMAIL_SENDER: {
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_FROM: string;
    };
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    FRONTEND_URL: string;
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    };
    STRIPE: {
        STRIPE_SECRET_KEY: string;
        STRIPE_WEBHOOK_SECRET: string;
    };
    GEMINI_API_KEY?: string; // Optional, যদি ব্যবহার করা হয়
    GEMINI_API_SECRET?: string; // Optional, যদি ব্যবহার করা হয়
}

// ২. ইন্টারফেস অনুযায়ী কনফিগ অবজেক্ট তৈরি করা
const config: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000', 
    DATABASE_URL: process.env.DATABASE_URL as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN || '7d',
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE || '24h',
    
    EMAIL_SENDER: {
        SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || 'smtp.gmail.com', 
        SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || '465',
        SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string, 
        SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string, 
        SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
    },

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    
    STRIPE: {   
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    },
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_API_SECRET: process.env.GEMINI_API_SECRET,
};

export default config;