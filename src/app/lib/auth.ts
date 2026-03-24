import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import env from "src/config/env";
import { sendEmail } from "../utils/email";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // ✅ ডাটাসোর্স হুক: ইউজার তৈরি হওয়ার সাথে সাথে প্রোফাইল তৈরি করবে
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    console.log(`👤 User created with ID: ${user.id}. Creating profile...`);
                    
                    if (user.role === Role.PARTICIPANT) {
                        await prisma.participant.create({
                            data: {
                                userId: user.id,
                                email: user.email,
                                name: user.name,
                            },
                        });
                        console.log("✅ Participant profile linked.");
                    } else if (user.role === Role.ORGANIZER) {
                        await prisma.organizer.create({
                            data: {
                                userId: user.id,
                                email: user.email,
                                name: user.name,
                                contactNumber: "N/A", 
                            },
                        });
                        console.log("✅ Organizer profile linked.");
                    }
                },
            },
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile) => {
                return {
                    role: Role.PARTICIPANT,
                    status: UserStatus.ACTIVE,
                    needPasswordChange: false,
                    emailVerified: true,
                    isDeleted: false,
                }
            }
        }
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PARTICIPANT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            }
        }
    },

    plugins: [
        bearer(),
        emailOTP({
            // ✅ ডিফল্ট ইমেইল ভেরিফিকেশন ওভাররাইড করা হয়েছে
            async sendVerificationOTP({ email, otp, type }) {
                // টার্মিনালে ওটিপি প্রিন্ট করা (ব্যাকআপ হিসেবে)
                console.log("-------------------------------");
                console.log(`📩 OTP for ${email}: ${otp}`);
                console.log(`-------------------------------`);

                /**
                 * 🛠️ Fix: নতুন ইউজারের ক্ষেত্রে findUnique অনেক সময় তৎক্ষণাৎ ডাটা পায় না।
                 * তাই আমরা সরাসরি ইমেইল পাঠানোর চেষ্টা করব।
                 */
                try {
                    await sendEmail({
                        to: email,
                        subject: type === "email-verification" ? "Verify your email" : "Password Reset OTP",
                        templateName: "otp",
                        templateData: { 
                            name: "User", // যেহেতু রেজিস্ট্রেশন প্রসেসে নাম পাঠানো হয়, এখানে জেনেরিক নাম রাখা নিরাপদ
                            otp: otp 
                        }
                    });
                    console.log(`✅ Email sent to ${email}`);
                } catch (error) {
                    console.error("❌ Failed to send email via sendEmail util:", error);
                }
            },
            expiresIn: 2 * 60,
            otpLength: 6,
        })
    ],

    trustedOrigins: [env.BETTER_AUTH_URL || "http://localhost:5000", env.FRONTEND_URL],
    advanced: {
        useSecureCookies: false, 
    }
});