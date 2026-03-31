import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums"; 
import { prisma } from "./prisma";
import { sendEmail } from "../utils/email";
import env from "../../config/env"; 

export const auth = betterAuth({
    baseURL: "http://localhost:5000", 
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // --- সোশ্যাল লগইন (গুগল) ---
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
                    console.log(`👤 Creating profile for User: ${user.email}`);
                    try {
                        const userRole = (user as any).role;

                        if (userRole === Role.PARTICIPANT) {
                            await prisma.participant.create({
                                data: {
                                    userId: user.id,
                                    email: user.email,
                                    name: user.name || "New Participant",
                                },
                            });
                        } else if (userRole === Role.ORGANIZER) {
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
                    } catch (error) {
                        console.error("❌ Profile Creation Hook Error:", error);
                    }
                },
            },
        },
    },

    // --- AUTH METHODS ---
    emailAndPassword: {
        enabled: true,
        // মনে রাখবেন: requireEmailVerification এখানে দরকার নেই যদি আপনি OTP প্লাগিন ব্যবহার করেন
    },

    // --- ADDITIONAL FIELDS ---
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
            // 'sendOnSignUp' এখানে নেই, তাই এটি সরানো হয়েছে
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
                } catch (error) {
                    console.error("❌ Email sending failed in Auth Plugin:", error);
                }
            },
            expiresIn: 300, // ৫ মিনিট মেয়াদ
            otpLength: 6,
        })
    ],

    trustedOrigins: ["http://localhost:3000", "http://localhost:5000"],
    advanced: {
        useSecureCookies: false, // লোকালহোস্টের জন্য false রাখা ভালো
    }
});

export default auth;