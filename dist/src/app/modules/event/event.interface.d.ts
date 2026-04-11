import { EventStatus } from "../../../generated/prisma/enums.js";
export type IEventCreatePayload = {
    title: string;
    description: string;
    category: string;
    dateTime: string;
    time: string;
    venue: string;
    location: string;
    thumbnail?: string;
    ticketPrice: number;
    totalSeats: number;
    availableSeats: number;
    airlineName?: string;
    flightNumber?: string;
    flightClass?: string;
    baggageAllowance?: string;
    isRefundable?: boolean;
};
export type IEventUpdatePayload = Partial<IEventCreatePayload> & {
    status?: EventStatus;
    isDeleted?: boolean;
};
export type IEventFilterRequest = {
    searchTerm?: string;
    category?: string;
    airlineName?: string;
    flightClass?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: EventStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
};
