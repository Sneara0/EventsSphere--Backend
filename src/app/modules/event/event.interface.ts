import { EventStatus } from "../../../generated/prisma/enums";

export type IEventCreatePayload = {
    title: string;
    description: string;
    category: string;
    date: string; // ISO String format
    time: string;
    venue: string;
    totalSeats: number;
    ticketPrice?: number;
    thumbnail?: string; // Cloudinary URL
};

export type IEventFilterRequest = {
    searchTerm?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: EventStatus; // string এর বদলে Enum ব্যবহার করা ভালো
    page?: number;        // প্যাগিনেশনের জন্য
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};