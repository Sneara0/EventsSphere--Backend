
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { IEventCreatePayload, IEventFilterRequest } from "./event.interface";
import AppError from "../../errorHelpers/AppError"; // পাথটি আপনার প্রোজেক্ট অনুযায়ী ঠিক করুন
import { Prisma } from "src/generated/prisma/client";

/**
 * 1. Create a new event
 */
const createEventIntoDB = async (userId: string, payload: IEventCreatePayload) => {
    // অর্গানাইজার প্রোফাইল আছে কি না চেক করা
    const organizer = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!organizer) {
        throw new AppError(status.NOT_FOUND, "Organizer profile not found!");
    }

    const result = await prisma.event.create({
        data: {
            ...payload,
            organizerId: organizer.id,
            availableSeats: payload.totalSeats, // শুরুতে totalSeats ই available থাকবে
        },
    });

    return result;
};

/**
 * 2. Get all events with filtering and search
 */
const getAllEventsFromDB = async (filters: IEventFilterRequest) => {
    const { searchTerm, category, minPrice, maxPrice, status: eventStatus } = filters;
    
    // Prisma.EventWhereInput টাইপ ব্যবহার করা হয়েছে টাইপ সেফটির জন্য
    const andConditions: Prisma.EventWhereInput[] = [];

    // Search logic (Title, Description, Venue)
    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { venue: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    // Category filter
    if (category) {
        andConditions.push({ category });
    }

    // Status filter (Upcoming/Ongoing etc.)
    if (eventStatus) {
        andConditions.push({ status: eventStatus });
    }

    // Price range filter (String থেকে Number এ কনভার্ট করা হয়েছে)
    if (minPrice || maxPrice) {
        andConditions.push({
            ticketPrice: {
                gte: minPrice ? parseFloat(minPrice) : undefined,
                lte: maxPrice ? parseFloat(maxPrice) : undefined,
            },
        });
    }

    // Soft delete check
    andConditions.push({ isDeleted: false });

    const result = await prisma.event.findMany({
        where: { AND: andConditions },
        include: {
            organizer: {
                include: { 
                    user: { 
                        select: { name: true, image: true } 
                    } 
                }
            }
        },
        orderBy: { date: 'asc' },
    });

    return result;
};

/**
 * 3. Get a single event by ID
 */
const getSingleEventFromDB = async (id: string) => {
    const result = await prisma.event.findUnique({
        where: { id, isDeleted: false },
        include: { 
            organizer: {
                include: { 
                    user: { 
                        select: { name: true, email: true, image: true } 
                    } 
                }
            },
            reviews: {
                include: {
                    user: { select: { name: true, image: true } }
                }
            }
        },
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Event not found!");
    }
    return result;
};

/**
 * 4. Update an event (with Ownership check)
 */
const updateEventIntoDB = async (eventId: string, userId: string, payload: Partial<IEventCreatePayload>) => {
    const isOwner = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!isOwner) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update this event!");
    }

    const result = await prisma.event.update({
        where: { id: eventId },
        data: payload,
    });
    return result;
};

/**
 * 5. Soft delete an event
 */
const deleteEventFromDB = async (eventId: string, userId: string) => {
    const isOwner = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!isOwner) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to delete this event!");
    }

    const result = await prisma.event.update({
        where: { id: eventId },
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