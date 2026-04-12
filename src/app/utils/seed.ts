/* eslint-disable no-console */

import { prisma } from "../lib/prisma.js";
import env from "../../config/env.js"; 
import { auth } from "../lib/auth.js";
import { Role } from "../../generated/prisma/enums.js";

export const seedSuperAdmin = async () => {
    console.log("🚀 Seeding started...");
    
    try {
        // ১. সুপার অ্যাডমিন ইউজার চেক ও তৈরি
        const isSuperAdminExist = await prisma.user.findFirst({
            where: { role: Role.SUPER_ADMIN }
        });

        if (!isSuperAdminExist) {
            console.log("⏳ Creating Super Admin via Better-Auth...");
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
                    await tx.user.update({
                        where: { id: userId },
                        data: { emailVerified: true }
                    });

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
                console.log("✅ Super Admin profile created!");
            }
        } else {
            console.log("ℹ️ Super admin already exists.");
        }

        // ২. আপনার স্কিমা অনুযায়ী কুপন কোড তৈরি (ফিক্সড)
        console.log("⏳ Seeding Test Coupons...");
        
        const coupons = [
            {
                code: "WELCOME10",
                discountValue: 10,       // আপনার স্কিমা অনুযায়ী discountValue
                isPercentage: false,
                expiryDate: new Date("2026-12-31"), // বাধ্যতামূলক ফিল্ড
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
                    discountValue: coupon.discountValue,
                    expiryDate: coupon.expiryDate,
                    isPercentage: coupon.isPercentage
                },
                create: coupon
            });
        }

        console.log("✅ Coupons seeded: 'WELCOME10' and 'OFF50' are ready to use!");

    } catch (error: any) {
        console.error("❌ Error during seeding:", error.message);
        process.exit(1);
    }
};

const run = async () => {
    try {
        await seedSuperAdmin();
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Database disconnected.");
        process.exit(0);
    }
};

run();