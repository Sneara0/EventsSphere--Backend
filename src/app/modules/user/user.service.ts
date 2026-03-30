import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUserUpdatePayload } from "./user.interface";

// ১. রোল অনুযায়ী সব ইউজার পাওয়া
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

// ২. নির্দিষ্ট একটি ইউজার আইডি দিয়ে ডাটা আনা
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

// ৩. নিজের প্রোফাইল দেখা
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

// ৪. সলিড প্রোফাইল আপডেট (Transaction সহ)
const updateMyProfileIntoDB = async (userId: string, role: Role, payload: IUserUpdatePayload) => {
    const { name, image, ...profileData } = payload;

    return await prisma.$transaction(async (tx) => {
        // ১. মেইন ইউজার টেবিল আপডেট
        if (name || image) {
            await tx.user.update({
                where: { id: userId },
                data: { name, image }
            });
        }

        // ২. রোল অনুযায়ী রিলেটেড টেবিল আপডেট
        // এখানে চেক করা হচ্ছে প্রোফাইল ডাটা খালি কি না এবং রোল ঠিক আছে কি না
        if (Object.keys(profileData).length > 0) {
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
            } else if (role === Role.ADMIN) {
                await tx.admin.update({
                    where: { userId },
                    data: profileData
                });
            }
        }

        // ৩. আপডেট শেষে লেটেস্ট ডাটা রিটার্ন করা
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

export const UserService = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB
};