
import { Prisma } from "src/generated/prisma/client";
import { Role } from "../../generated/prisma/enums";
//import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

import env from "src/config/env";
import { auth } from "../lib/auth";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        });

        if (isSuperAdminExist) {
            console.log("Super admin already exists. Skipping seeding super admin.");
            return;
        }

        // ১. Auth API দিয়ে ইউজার তৈরি
        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: env.SUPER_ADMIN_EMAIL!,
                password: env.SUPER_ADMIN_PASSWORD!,
                name: "Super Admin",
                role: Role.SUPER_ADMIN,
                // @ts-ignore (যদি আপনার অথে এই ফিল্ডগুলো থাকে)
                needPasswordChange: false,
                // @ts-ignore
                rememberMe: false,
            }
        });

        if (!superAdminUser || !superAdminUser.user) {
            throw new Error("Failed to create user via Auth API");
        }

        // ২. ট্রানজেকশন ব্যবহার করে ডেটা আপডেট ও অ্যাডমিন প্রোফাইল তৈরি
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // ইমেইল ভেরিফাইড করা
            await tx.user.update({
                where: { id: superAdminUser.user.id },
                data: { emailVerified: true }
            });

            // অ্যাডমিন প্রোফাইল তৈরি (নতুন মডেল অনুযায়ী)
            await tx.admin.create({
                data: {
                    name: "Super Admin",
                    email: env.SUPER_ADMIN_EMAIL!,
                    contactNumber: "01700000000", // আপনার মডেল অনুযায়ী এটি রিকোয়ার্ড
                    designation: "System Administrator",
                    user: {
                        connect: { id: superAdminUser.user.id }
                    }
                }
            });
        });

        const finalAdmin = await prisma.admin.findFirst({
            where: { email: env.SUPER_ADMIN_EMAIL },
            include: { user: true }
        });

        console.log("✅ Super Admin Created Successfully:", finalAdmin);
    } catch (error) {
        console.error("❌ Error seeding super admin:", error);
        
        // ক্লিনআপ: যদি ইউজার তৈরি হয়ে যায় কিন্তু ট্রানজেকশন ফেইল করে
        try {
            await prisma.user.delete({
                where: { email: env.SUPER_ADMIN_EMAIL }
            });
            console.log("Cleanup: Incomplete super admin user deleted.");
        } catch (cleanupError) {
            // ইউজার না থাকলে এরর ইগনোর করবে
        }
    }
};