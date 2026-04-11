/* eslint-disable no-console */


import { prisma } from "../lib/prisma.js";
import env from "../../config/env.js"; 
import { auth } from "../lib/auth.js";
import { Role } from "../../generated/prisma/enums.js";


export const seedSuperAdmin = async () => {
    console.log("🚀 Seeding started...");
    
    try {
        // ১. আগে চেক করা সুপার অ্যাডমিন আছে কি না
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        });

        if (isSuperAdminExist) {
            console.log("ℹ️ Super admin already exists. Skipping seeding.");
            return;
        }

        console.log("⏳ Creating Super Admin via Better-Auth API...");

        // ২. Better-Auth API দিয়ে ইউজার তৈরি (যাতে পাসওয়ার্ড হ্যাশিং ঠিক থাকে)
        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: env.SUPER_ADMIN_EMAIL as string,
                password: env.SUPER_ADMIN_PASSWORD as string,
                name: "Super Admin",
                // @ts-ignore: Better-Auth additional fields handling
                role: Role.SUPER_ADMIN,
            }
        });

        if (!superAdminUser || !superAdminUser.user) {
            throw new Error("❌ Failed to create user via Auth API");
        }

        const userId = superAdminUser.user.id;

        // ৩. প্রিজমা ট্রানজেকশন: ইমেইল ভেরিফাই এবং অ্যাডমিন প্রোফাইল তৈরি
        await prisma.$transaction(async (tx) => {
            // ইমেইল ভেরিফাইড স্ট্যাটাস আপডেট
            await tx.user.update({
                where: { id: userId },
                data: { emailVerified: true }
            });

            // অ্যাডমিন টেবিলে এন্ট্রি দেওয়া
            await tx.admin.create({
                data: {
                    name: "Super Admin",
                    email: env.SUPER_ADMIN_EMAIL as string,
                    contactNumber: "01700000000",
                    designation: "System Administrator",
                    user: {
                        connect: { id: userId }
                    }
                }
            });
        });

        console.log("✅ Super Admin and Admin Profile created successfully!");

    } catch (error: any) {
        console.error("❌ Error during seeding:", error.message);
        
        // ক্লিনআপ: যদি ইউজার তৈরি হয় কিন্তু প্রোফাইল তৈরিতে এরর হয়
        try {
            const user = await prisma.user.findUnique({ 
                where: { email: env.SUPER_ADMIN_EMAIL as string } 
            });
            if (user) {
                await prisma.user.delete({ where: { id: user.id } });
                console.log("🧹 Cleanup: Incomplete user record deleted.");
            }
        } catch (cleanupError) {
            // No action needed if user doesn't exist
        }
        
        process.exit(1);
    }
};

// ফাইলটি সরাসরি রান করার জন্য সেলফ-ইনভোকিং ফাংশন
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