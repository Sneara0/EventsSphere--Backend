import { Role, UserStatus } from "../../../generated/prisma/enums";

// ১. ইউজারের মূল ইন্টারফেস (ডাটাবেস মডেল অনুযায়ী)
export type IUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: UserStatus;
    image?: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};

// ২. প্রোফাইল আপডেট করার জন্য পেলোড (Partial ব্যবহার করা হয়েছে যাতে সব ফিল্ড ম্যান্ডেটরি না হয়)
export type IUserUpdatePayload = {
    name?: string;
    image?: string;
    contactNumber?: string;
    address?: string;
    bio?: string;
};

// ৩. রোল ভিত্তিক সার্চ করার জন্য ফিল্টার অপশন
export type IUserFilterRequest = {
    searchTerm?: string;
    role?: Role;
    status?: UserStatus;
    email?: string;
};

// ৪. পেজিনেশন এবং শর্টিং অপশন (যদি ভবিষ্যতে লাগে)
export type IUserOptions = {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};