import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUserUpdatePayload } from "./user.interface";

// ১. রোল অনুযায়ী সব ইউজার পাওয়া (Admin এর জন্য)
const getAllUsersFromDB = async (role?: Role) => {
    const result = await prisma.user.findMany({
        where: {
            role: role ? role : undefined,
            isDeleted: false,
        },
        include: {
            participant: true,
            organizer: true,
            admin: true,
        },
    });
    return result;
};

// ২. ✅ নতুন ফাংশন: নির্দিষ্ট একটি ইউজার আইডি দিয়ে ডাটা আনা
const getSingleUserFromDB = async (id: string) => {
    const result = await prisma.user.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            participant: true,
            organizer: true,
            admin: true,
        },
    });
    return result;
};

// ৩. নিজের প্রোফাইল দেখা (Role-wise include)
const getMyProfileFromDB = async (userId: string, role: Role) => {
    const result = await prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        include: {
            participant: role === Role.PARTICIPANT,
            organizer: role === Role.ORGANIZER,
            admin: role === Role.ADMIN,
        },
    });
    return result;
};

// ৪. রোল অনুযায়ী প্রোফাইল আপডেট করা
const updateMyProfileIntoDB = async (userId: string, role: Role, payload: IUserUpdatePayload) => {
    const { name, image, ...profileData } = payload;

    return await prisma.$transaction(async (tx) => {
        // মেইন ইউজার টেবিল আপডেট (Name, Image)
        if (name || image) {
            await tx.user.update({
                where: { id: userId },
                data: { name, image }
            });
        }

        // রোল অনুযায়ী স্পেসিফিক টেবিল আপডেট (Participant/Organizer)
        if (role === Role.PARTICIPANT) {
            await tx.participant.update({
                where: { userId },
                data: profileData
            });
        } else if (role === Role.ORGANIZER) {
            await tx.organizer.update({
                where: { userId },
                data: profileData
            });
        }

        return await tx.user.findUnique({
            where: { id: userId },
            include: {
                participant: role === Role.PARTICIPANT,
                organizer: role === Role.ORGANIZER,
            }
        });
    });
};

// ৫. 🛠️ এক্সপোর্ট অবজেক্ট আপডেট
export const UserService = {
    getAllUsersFromDB,
    getSingleUserFromDB, // 👈 এটি অবশ্যই থাকতে হবে
    getMyProfileFromDB,
    updateMyProfileIntoDB
};