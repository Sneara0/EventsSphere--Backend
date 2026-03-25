import { Prisma, EventStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IEventCreatePayload, IEventFilterRequest } from "./event.interface";

/**
 * ১. ইভেন্ট তৈরি করা (Create Event)
 */
const createEventIntoDB = async (userId: string, payload: IEventCreatePayload) => {
    const organizer = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!organizer) {
        throw new Error("Organizer profile not found!");
    }

    const result = await prisma.event.create({
        data: {
            ...payload,
            organizerId: organizer.id,
            availableSeats: payload.totalSeats, 
        },
    });

    return result;
};

/**
 * ২. সব ইভেন্ট পাওয়া (Search, Filter & Pagination)
 */
const getAllEventsFromDB = async (filters: IEventFilterRequest) => {
    const { searchTerm, category, minPrice, maxPrice, status } = filters;
    const andConditions: Prisma.EventWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { venue: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    if (category) {
        andConditions.push({ category });
    }

    if (minPrice || maxPrice) {
        andConditions.push({
            ticketPrice: {
                gte: minPrice ? parseFloat(minPrice) : undefined,
                lte: maxPrice ? parseFloat(maxPrice) : undefined,
            },
        });
    }

    if (status) {
        andConditions.push({ status: status as EventStatus });
    }

    andConditions.push({ isDeleted: false });

    const whereConditions: Prisma.EventWhereInput = { AND: andConditions };

    const result = await prisma.event.findMany({
        where: whereConditions,
        include: {
            organizer: {
                include: {
                    user: {
                        select: { name: true, image: true }
                    }
                }
            }
        },
        orderBy: {
            date: 'asc',
        },
    });

    return result;
};

/**
 * ৩. নির্দিষ্ট একটি ইভেন্ট দেখা
 */
const getSingleEventFromDB = async (id: string) => {
    const result = await prisma.event.findUniqueOrThrow({
        where: { id, isDeleted: false },
        include: {
            organizer: true,
            reviews: true, // আমরা মাত্রই schema ঠিক করেছি, তাই এটি এখন কাজ করবে
            bookings: {
                where: { status: "CONFIRMED" }
            }
        },
    });
    return result;
};

/**
 * ৪. ইভেন্ট আপডেট করা (Update Event)
 */
const updateEventIntoDB = async (id: string, userId: string, payload: Partial<IEventCreatePayload>) => {
    // চেক করা হচ্ছে ইভেন্টটি ওই অর্গানাইজারের কি না
    const isOwner = await prisma.event.findFirst({
        where: {
            id,
            organizer: { userId }
        }
    });

    if (!isOwner) {
        throw new Error("You are not authorized to update this event!");
    }

    const result = await prisma.event.update({
        where: { id },
        data: payload,
    });

    return result;
};

/**
 * ৫. ইভেন্ট ডিলেট করা (Soft Delete)
 */
const deleteEventFromDB = async (id: string, userId: string) => {
    const isOwner = await prisma.event.findFirst({
        where: {
            id,
            organizer: { userId }
        }
    });

    if (!isOwner) {
        throw new Error("You are not authorized to delete this event!");
    }

    const result = await prisma.event.update({
        where: { id },
        data: { isDeleted: true },
    });

    return result;
};

export const EventService = {
    createEventIntoDB,
    getAllEventsFromDB,
    getSingleEventFromDB,
    updateEventIntoDB,
    deleteEventFromDB
};