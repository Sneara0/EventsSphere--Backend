import dotenv from 'dotenv';
import path from 'path';

// .env ফাইলটি প্রজেক্টের রুট ডিরেক্টরি থেকে লোড করা হচ্ছে
dotenv.config({ path: path.join(process.cwd(), '.env') });

interface EnvConfig {
    NODE_ENV: string;
    PORT: string; // নিশ্চিত করুন এটি স্ট্রিং হিসেবেই রিড হবে
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
    SMTP_HOST: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    FRONTEND_URL: string;
}

const config: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    // মেইন ফিক্স: যদি এনভায়রনমেন্টে পোর্ট না থাকে তবে ডিফল্ট '5000' নিবে
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
        // এখানে নামগুলো আপনার .env ফাইলের নামের সাথে মিল রেখে লিখুন
        SMTP_HOST: process.env.SMTP_HOST as string, 
        SMTP_PORT: process.env.SMTP_PORT || '587',
        SMTP_USER: process.env.SMTP_USER as string,
        SMTP_PASS: process.env.SMTP_PASS as string,
        SMTP_FROM: process.env.SMTP_FROM as string,
    },
    SMTP_HOST: process.env.SMTP_HOST as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
};

export default config;