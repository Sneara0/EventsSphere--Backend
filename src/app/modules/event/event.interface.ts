import { EventStatus } from "src/generated/prisma/enums";

export type IEventCreatePayload = {
    title: string;
    description: string;
    category: string;
    dateTime: string; // 'date' এর বদলে 'dateTime' করা হয়েছে
    time: string;
    venue: string;
    location: string;
    thumbnail?: string; 
    ticketPrice: number;
    totalSeats: number;
    maxCapacity?: number;
};

export type IEventUpdatePayload = Partial<IEventCreatePayload> & {
    status?: EventStatus;
    isDeleted?: boolean;
};

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