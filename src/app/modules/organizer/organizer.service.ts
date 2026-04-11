import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";
import { IOrganizerCreatePayload, IOrganizerUpdatePayload } from "./organizer.interface.js";
import { Prisma } from "../../../generated/prisma/client.js";

/**
 * ১. প্রথমবার প্রোফাইল তৈরি করা
 * (User টেবিল থেকে email এবং name নিয়ে আসা হচ্ছে)
 */
const createProfileIntoDB = async (userId: string, payload: IOrganizerCreatePayload) => {
    // চেক করা যে এই ইউজারের অলরেডি কোনো প্রোফাইল আছে কি না
    const isExist = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (isExist) {
        throw new AppError(status.BAD_REQUEST, "Organizer profile already exists for this user!");
    }

    // ইউজার টেবিল থেকে ইমেইল এবং নাম নিয়ে আসা (যেহেতু মডেলে এগুলো রিকোয়ার্ড হতে পারে)
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found!");
    }

    // নতুন প্রোফাইল তৈরি
    const result = await prisma.organizer.create({
        data: {
            ...payload,
            userId,
            email: user.email, // ✅ ডাটাবেজের 'email' রিকোয়ারমেন্ট পূরণ করবে
            name: user.name,   // ইউজারের নামটিও এখানে সিঙ্ক করে রাখা ভালো
        },
    });

    return result;
};

/**
 * ২. নিজের প্রোফাইল ডাটাবেজ থেকে আনা
 */
const getMyProfileFromDB = async (userId: string) => {
    const result = await prisma.organizer.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    status: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Organizer profile not found!");
    }

    return result;
};

/**
 * ৩. প্রোফাইল আপডেট করা (Transaction ব্যবহার করে)
 */
const updateMyProfileIntoDB = async (userId: string, payload: IOrganizerUpdatePayload) => {
    const isExist = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!isExist) {
        throw new AppError(status.NOT_FOUND, "Organizer profile not found!");
    }

    return await prisma.$transaction(async (tx:Prisma.TransactionClient) => {
        const { organizationName, contactNumber, website, bio, logo, ...userData } = payload;

        // যদি User টেবিলের ডাটা (যেমন name বা image) আপডেট করতে হয়
        if (Object.keys(userData).length > 0) {
            await tx.user.update({
                where: { id: userId },
                data: userData,
            });
        }

        // Organizer টেবিল আপডেট
        const updatedOrganizer = await tx.organizer.update({
            where: { userId },
            data: {
                organizationName,
                contactNumber,
                website,
                bio,
                logo,
                // যদি পেলোডে নাম/ইমেইল থাকে তবে অর্গানাইজার টেবিলেও আপডেট হবে
                name: userData.name || undefined,
                email: userData.email || undefined,
            },
            include: { user: true },
        });

        return updatedOrganizer;
    });
};

/**
 * ৪. সব অর্গানাইজার লিস্ট (ফিল্টারসহ)
 */
const getAllOrganizersFromDB = async (filters: any) => {
    const { searchTerm, isVerified } = filters;
    
    return await prisma.organizer.findMany({
        where: {
            isVerified: isVerified ? isVerified === 'true' : undefined,
            OR: searchTerm ? [
                { organizationName: { contains: searchTerm, mode: 'insensitive' } },
                { contactNumber: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
            ] : undefined,
        },
        include: {
            user: { select: { name: true, image: true } }
        }
    });
};

/**
 * ৫. নির্দিষ্ট আইডি দিয়ে অর্গানাইজার ডিটেইলস
 */
const getSingleOrganizerFromDB = async (id: string) => {
    const result = await prisma.organizer.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, image: true } },
            events: { 
                where: { isDeleted: false },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Organizer not found!");
    }

    return result;
};

export const OrganizerService = {
    createProfileIntoDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
    getAllOrganizersFromDB,
    getSingleOrganizerFromDB,
};