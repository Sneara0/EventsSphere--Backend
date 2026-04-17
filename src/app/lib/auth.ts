// 📂 src/app/lib/auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums.js"; 
import { prisma } from "./prisma.js";
import { sendEmail } from "../utils/email.js";
import env from "../../config/env.js"; 

export const auth = betterAuth({
    // baseURL অবশ্যই আপনার ব্যাকএন্ডের ফুল এপিআই পাথ হতে হবে
    baseURL: env.BETTER_AUTH_URL || "https://eventsphere-backend-seven.vercel.app/api/v1/auth", 
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

    // --- প্রোডাকশন সিকিউরিটি সেটিংস ---
    // টাইপ এরর এড়াতে trustedOrigins সরাসরি এখানে দিন
    trustedOrigins: [
        "http://localhost:3000", 
        "https://eventspehere-frontend.vercel.app" 
    ],

    advanced: {
        // প্রোডাকশনে Secure Cookies অটোমেটিক হ্যান্ডেল করার জন্য
        useSecureCookies: process.env.NODE_ENV === "production",
    },

    // সেশন কনফিগারেশন যা ক্রস-ডোমেইন কুকি হ্যান্ডেল করবে
    session: {
        cookieCache: {
            enabled: true,
        },
        // সেশনের স্থায়িত্ব
        expiresIn: 60 * 60 * 24 * 7, // ৭ দিন
    }
});

export default auth;