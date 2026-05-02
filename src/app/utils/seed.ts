/* eslint-disable no-console */
import { prisma } from "../lib/prisma.js";
import env from "../../config/env.js"; 
import { auth } from "../lib/auth.js";
import { Role } from "../../generated/prisma/enums.js";

/**
 * মেইন সিডিং ফাংশন
 */
export const runSeeding = async () => {
    console.log("🚀 Seeding process started...");
    
    try {
        // --- ১. সুপার অ্যাডমিন তৈরি (Better-Auth এর মাধ্যমে) ---
        const isSuperAdminExist = await prisma.user.findFirst({
            where: { role: Role.SUPER_ADMIN }
        });

        if (!isSuperAdminExist) {
            console.log("⏳ Creating Super Admin...");
            const superAdminUser = await auth.api.signUpEmail({
                body: {
                    email: env.SUPER_ADMIN_EMAIL as string,
                    password: env.SUPER_ADMIN_PASSWORD as string,
                    name: "Super Admin",
                    // @ts-ignore
                    role: Role.SUPER_ADMIN,
                }
            });

            if (superAdminUser && superAdminUser.user) {
                const userId = superAdminUser.user.id;
                await prisma.$transaction(async (tx) => {
                    // ইমেইল ভেরিফাইড করা
                    await tx.user.update({
                        where: { id: userId },
                        data: { emailVerified: true }
                    });

                    // অ্যাডমিন প্রোফাইল তৈরি
                    await tx.admin.create({
                        data: {
                            name: "Super Admin",
                            email: env.SUPER_ADMIN_EMAIL as string,
                            contactNumber: "01700000000",
                            designation: "System Administrator",
                            user: { connect: { id: userId } }
                        }
                    });
                });
                console.log("✅ Super Admin and Profile created!");
            }
        } else {
            console.log("ℹ️ Super admin already exists.");
        }

        // --- ২. ডেমো অ্যাডমিন ও ইউজার তৈরি (টেস্টিং এর জন্য) ---
        console.log("⏳ Seeding Demo Credentials...");
        const demoUsers = [
            { 
                email: "admin@demo.com", 
                name: "Demo Admin", 
                role: Role.ADMIN, 
                password: "password123" 
            },
            { 
                email: "user@demo.com", 
                name: "Demo User", 
                role: Role.PARTICIPANT, 
                password: "password123" 
            }
        ];

        for (const u of demoUsers) {
            const exists = await prisma.user.findUnique({ where: { email: u.email } });
            if (!exists) {
                await auth.api.signUpEmail({
                    body: {
                        email: u.email,
                        password: u.password,
                        name: u.name,
                        // @ts-ignore
                        role: u.role,
                    }
                });
                console.log(`✅ Created ${u.role}: ${u.email} (Pass: ${u.password})`);
            }
        }

        // --- ৩. কুপন কোড তৈরি ---
        console.log("⏳ Seeding Test Coupons...");
        const coupons = [
            {
                code: "WELCOME10",
                discountValue: 10,
                isPercentage: false,
                expiryDate: new Date("2026-12-31"),
                isActive: true,
                usageLimit: 100
            },
            {
                code: "OFF50",
                discountValue: 50,
                isPercentage: true,
                expiryDate: new Date("2026-12-31"),
                isActive: true,
                usageLimit: 50
            }
        ];

        for (const coupon of coupons) {
            await prisma.coupon.upsert({
                where: { code: coupon.code },
                update: { 
                    isActive: coupon.isActive, 
                    discountValue: coupon.discountValue 
                },
                create: coupon
            });
        }
        console.log("✅ Coupons seeded successfully!");

        console.log("✨ All seeding tasks completed successfully!");

    } catch (error: any) {
        console.error("❌ Error during seeding:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Database disconnected.");
        process.exit(0);
    }
};

// স্ক্রিপ্টটি রান করা
runSeeding();