


import { Role, UserStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

/**
 * ১. রোল অনুযায়ী সব ইউজার পাওয়া (একটিভ ইউজারদের জন্য)
 */
const getAllUsersFromDB = async (role?: Role) => {
    return await prisma.user.findMany({
        where: {
            role: role || undefined,
            isDeleted: false,
        },
        include: {
            participant: true,
            organizer: true,
            admin: true,
        },
    });
};

/**
 * ২. নির্দিষ্ট একটি ইউজার আইডি দিয়ে ডাটা আনা
 */
const getSingleUserFromDB = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id, isDeleted: false },
        include: {
            participant: true,
            organizer: true,
            admin: true,
        },
    });
};

/**
 * ৩. নিজের প্রোফাইল দেখা
 */
const getMyProfileFromDB = async (userId: string, role: Role) => {
    return await prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        include: {
            participant: role === Role.PARTICIPANT,
            organizer: role === Role.ORGANIZER,
            admin: role === Role.ADMIN,
        },
    });
};

/**
 * ৪. প্রোফাইল আপডেট (Transaction সহ)
 */
const updateMyProfileIntoDB = async (userId: string, role: Role, payload: any) => {
    const { name, image, profileImage, phone, email, ...otherData } = payload;

    return await prisma.$transaction(async (tx) => {
        // ১. মেইন ইউজার টেবিল আপডেট
        const userUpdateData: any = {};
        if (name) userUpdateData.name = name;
        if (image || profileImage) userUpdateData.image = image || profileImage;

        if (Object.keys(userUpdateData).length > 0) {
            await tx.user.update({
                where: { id: userId },
                data: userUpdateData
            });
        }

        // ২. রোল অনুযায়ী রিলেটেড টেবিল ডাটা রেডি করা
        const relatedTableData: any = { ...otherData };
        
        if (phone) {
            relatedTableData.contactNumber = phone;
        }

        if (image || profileImage) {
            relatedTableData.profileImage = image || profileImage;
        }
        
        if (name) {
            relatedTableData.name = name;
        }

        // ৩. ডাইনামিকালি সঠিক টেবিলে আপডেট করা (Upsert ব্যবহার করে)
        if (Object.keys(relatedTableData).length > 0) {
            const mapper: Record<Role, any> = {
                [Role.ADMIN]: tx.admin,
                [Role.ORGANIZER]: tx.organizer,
                [Role.PARTICIPANT]: tx.participant,
                [Role.SUPER_ADMIN]: tx.admin,
                [Role.USER]: tx.participant, 
            };

            /**
             * 🔥 এখানে upsert ব্যবহার করা হয়েছে যাতে রেকর্ড না থাকলে তৈরি হয়।
             * এটি P2025 এররটি সমাধান করবে।
             */
            await mapper[role].upsert({
                where: { userId },
                update: relatedTableData,
                create: { 
                    userId, 
                    ...relatedTableData,
                    // যদি name বা email রিকোয়ার্ড হয় তবে তা নিশ্চিত করা
                    name: name || "User",
                    email: email || "" 
                },
            });
        }

        // ৪. আপডেট শেষে লেটেস্ট ডাটা রিটার্ন করা
        return await tx.user.findUnique({
            where: { id: userId },
            include: {
                participant: role === Role.PARTICIPANT,
                organizer: role === Role.ORGANIZER,
                admin: role === Role.ADMIN,
            }
        });
    });
};

/**
 * ৫. ইউজার ডিলিট করা (Soft Delete) 
 */
const deleteUserFromDB = async (id: string) => {
    return await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
    });
};

export const UserService = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
    deleteUserFromDB
};