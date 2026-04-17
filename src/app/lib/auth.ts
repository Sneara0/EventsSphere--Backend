import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums.js"; 
import { prisma } from "./prisma.js";
import { sendEmail } from "../utils/email.js";
import env from "../../config/env.js"; 

export const auth = betterAuth({
    // ⚠️ baseURL প্রোডাকশনে অবশ্যই ডাইনামিক হতে হবে
    baseURL: process.env.NODE_ENV === "production" 
        ? "https://eventspehere-backend.onrender.app" // আপনার লাইভ ব্যাকএন্ড ইউআরএল
        : "http://localhost:5000",
    
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },
    },

    // --- DATABASE HOOKS ---
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        const userRole = (user as any).role;
                        if (userRole === Role.PARTICIPANT) {
                            await prisma.participant.create({
                                data: { userId: user.id, email: user.email, name: user.name || "New Participant" },
                            });
                        } else if (userRole === Role.ORGANIZER) {
                            await prisma.organizer.create({
                                data: { userId: user.id, email: user.email, name: user.name || "New Organizer", contactNumber: "01XXXXXXXXX" },
                            });
                        }
                    } catch (error) {
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
                } catch (error) {
                    console.error("❌ Email failed:", error);
                }
            },
            expiresIn: 300,
            otpLength: 6,
        })
    ],

    // 🔐 প্রোডাকশনে 403 এরর ঠেকাতে এটি অত্যন্ত গুরুত্বপূর্ণ
    trustedOrigins: [
        "http://localhost:3000", 
        "https://eventspehere-frontend.vercel.app",
        "https://eventspehere-frontend-54isxxop6-sanzid-islaam-nabil-projects.vercel.app" // ভার্সেল প্রিভিউ লিঙ্ক
    ],

    advanced: {
        // ক্রস-সাইট কুকি প্রোডাকশনে কাজ করার জন্য এটি প্রয়োজন
        useSecureCookies: process.env.NODE_ENV === "production",
        // আপনি যদি ডোমেইন আলাদা রাখেন (Render vs Vercel), তবে এটি ট্রু রাখুন
        crossSubdomainCookies: {
            enabled: process.env.NODE_ENV === "production",
        }
    },

    session: {
        cookieCache: {
            enabled: true,
        },
        expiresIn: 60 * 60 * 24 * 7, // ৭ দিন
    }
});

export default auth;