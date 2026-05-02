import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums.js";
import { prisma } from "./prisma.js";
import { sendEmail } from "../utils/email.js";
import env from "../../config/env.js";
export const auth = betterAuth({
    // baseURL প্রোডাকশনে অবশ্যই আপনার ব্যাকএন্ডের ফুল এপিআই পাথ হতে হবে
    baseURL: process.env.NODE_ENV === "production"
        ? "https://eventspehere-backend.onrender.app"
        : "http://localhost:5000",
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    // --- DATABASE HOOKS ---
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        const userRole = user.role;
                        if (userRole === Role.PARTICIPANT) {
                            await prisma.participant.create({
                                data: { userId: user.id, email: user.email, name: user.name || "New Participant" },
                            });
                        }
                        else if (userRole === Role.ORGANIZER) {
                            await prisma.organizer.create({
                                data: { userId: user.id, email: user.email, name: user.name || "New Organizer", contactNumber: "01XXXXXXXXX" },
                            });
                        }
                    }
                    catch (error) {
                        console.error("❌ Profile Creation Hook Error:", error);
                    }
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            role: { type: "string", required: true, defaultValue: Role.PARTICIPANT, input: true },
            status: { type: "string", required: true, defaultValue: UserStatus.ACTIVE, input: true },
            needPasswordChange: { type: "boolean", defaultValue: false, input: true },
            isDeleted: { type: "boolean", defaultValue: false, input: true }
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                try {
                    await sendEmail({
                        to: email,
                        subject: type === "email-verification" ? "Verify Account" : "Reset Password",
                        templateName: "otp",
                        templateData: { name: "User", otp: otp }
                    });
                }
                catch (error) {
                    console.error("❌ Email failed:", error);
                }
            },
            expiresIn: 300,
            otpLength: 6,
        })
    ],
    // 🔐 মোবাইলের জন্য এটি অত্যন্ত গুরুত্বপূর্ণ (CORS Whitelist)
    trustedOrigins: [
        "http://localhost:3000",
        "https://eventspehere-frontend.vercel.app",
        "https://eventspehere-frontend-54isxxop6-sanzid-islaam-nabil-projects.vercel.app"
    ],
    advanced: {
        // প্রোডাকশনে Secure Cookies অবশ্যই true
        useSecureCookies: process.env.NODE_ENV === "production",
        // 📱 মোবাইলে ব্রাউজারের থার্ড-পার্টি কুকি ব্লক এড়ানোর জন্য ফাইনাল সেটিংস
        cookie: {
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
        },
        crossSubdomainCookies: {
            enabled: process.env.NODE_ENV === "production",
        }
    },
    session: {
        cookieCache: {
            enabled: true,
        },
        expiresIn: 60 * 60 * 24 * 7, // ৭ দিন
        freshAge: 0, // সেশন সবসময় রিফ্রেশ রাখার জন্য
    }
});
export default auth;
