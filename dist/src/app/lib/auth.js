import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
// Prisma থেকে Role এবং UserStatus ইমপোর্ট নিশ্চিত করুন
import { Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import { sendEmail } from "../utils/email";
import env from "../../config/env";
export const auth = betterAuth({
    // ১. আপনার ফ্রন্টএন্ড যদি ৩০০০ পোর্টে চলে, তবে baseURL সেটাই হওয়া উচিত
    baseURL: env.BETTER_AUTH_URL || "http://localhost:3000",
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
    // --- DATABASE HOOKS (FIXED) ---
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    console.log(`👤 Creating profile for User: ${user.email}`);
                    try {
                        // BetterAuth এ অতিরিক্ত ফিল্ডগুলো সরাসরি user অবজেক্টে থাকে
                        const userRole = user.role;
                        if (userRole === Role.PARTICIPANT) {
                            await prisma.participant.create({
                                data: {
                                    userId: user.id,
                                    email: user.email,
                                    name: user.name || "New Participant",
                                },
                            });
                        }
                        else if (userRole === Role.ORGANIZER) {
                            await prisma.organizer.create({
                                data: {
                                    userId: user.id,
                                    email: user.email,
                                    name: user.name || "New Organizer",
                                    contactNumber: "01XXXXXXXXX",
                                },
                            });
                        }
                        console.log("✅ Profile linked successfully.");
                    }
                    catch (error) {
                        // হুক এরর দিলে রেজিস্ট্রেশন ফেইল করবে না যদি আমরা এখানে হ্যান্ডেল করি
                        console.error("❌ Profile Creation Hook Error:", error);
                    }
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        // ২. OTP প্লাগিন থাকলে এটি false রাখা নিরাপদ যাতে কনফ্লিক্ট না হয়
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PARTICIPANT,
                input: true,
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE,
                input: true,
            },
            needPasswordChange: {
                type: "boolean",
                defaultValue: false,
                input: true,
            },
            isDeleted: {
                type: "boolean",
                defaultValue: false,
                input: true,
            }
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                console.log(`📩 OTP generated for ${email}: ${otp}`);
                try {
                    await sendEmail({
                        to: email,
                        subject: type === "email-verification"
                            ? "Verify your Event Sphere account"
                            : "Password Reset OTP",
                        templateName: "otp",
                        templateData: {
                            name: "User",
                            otp: otp
                        }
                    });
                    console.log(`✅ OTP Email sent successfully to ${email}`);
                }
                catch (error) {
                    console.error("❌ Email sending failed in Auth Plugin:", error);
                }
            },
            expiresIn: 300,
            otpLength: 6,
        })
    ],
    // ৩. অরিজিনগুলো নিশ্চিত করুন যাতে CORS এরর না আসে
    trustedOrigins: ["http://localhost:3000", "http://localhost:5000"],
    advanced: {
        useSecureCookies: false,
    }
});
export default auth;
