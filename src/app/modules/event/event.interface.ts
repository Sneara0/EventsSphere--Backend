import { EventStatus } from "src/generated/prisma/enums";

/**
 * ১. ইভেন্ট তৈরি করার জন্য পে-লোড ইন্টারফেস
 * এটি FormData থেকে আসা ডাটাকে টাইপ-সেফ রাখতে সাহায্য করবে।
 */
export type IEventCreatePayload = {
    title: string;
    description: string;
    category: string;
    date: string; // ISO String হিসেবে আসবে
    time: string;
    venue: string;
    thumbnail?: string; // Cloudinary URL
    ticketPrice: number;
    totalSeats: number;
    maxCapacity?: number;
};

/**
 * ২. ইভেন্ট আপডেট করার জন্য ইন্টারফেস (সব ফিল্ড অপশনাল)
 */
export type IEventUpdatePayload = Partial<IEventCreatePayload> & {
    status?: EventStatus;
    isDeleted?: boolean;
};

/**
 * ৩. ইভেন্ট ফিল্টার করার জন্য কুয়েরি ইন্টারফেস
 * এটি সার্চ এবং ফিল্টারিং লজিক সহজ করবে।
 */
export type IEventFilterRequest = {
    searchTerm?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: EventStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
};

/**
 * ৪. ইভেন্ট রেসপন্স মেটা-ডাটা (যদি প্রয়োজন হয়)
 */
export type IEventResponse = {
    id: string;
    title: string;
    availableSeats: number;
    organizerId: string;
    createdAt: Date;
    updatedAt: Date;
};
export type IUserUpdatePayload = {
    name?: string;
    image?: string;
    contactNumber?: string;
    address?: string;
    bio?: string;
    organizationName?: string;
};