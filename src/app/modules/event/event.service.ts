import status from "http-status";
import { prisma } from "../../lib/prisma";
import { IEventCreatePayload, IEventFilterRequest } from "./event.interface";
import AppError from "../../errorHelpers/AppError"; 
import { Prisma } from "src/generated/prisma/client";


/**
 * 1. Create a new event
 * এখানে টাইপ এরর ফিক্স করা হয়েছে এবং location ফিল্ড নিশ্চিত করা হয়েছে।
 */
const createEventIntoDB = async (userId: string, payload: IEventCreatePayload) => {
    // ১. অর্গানাইজার প্রোফাইল চেক
    const organizer = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!organizer) {
        throw new AppError(status.NOT_FOUND, "Organizer profile not found!");
    }

    // ২. ডাটাবেজে ইভেন্ট তৈরি (সব রিকোয়ার্ড ফিল্ডসহ)
    const result = await prisma.event.create({
        data: {
            title: payload.title,
            description: payload.description,
            category: payload.category,
            location: payload.location, // এটি আপনার এররের প্রধান কারণ ছিল
            venue: payload.venue,
            time: payload.time,
            thumbnail: payload.thumbnail || null,
            ticketPrice: Number(payload.ticketPrice) || 0,
            totalSeats: Number(payload.totalSeats),
            availableSeats: Number(payload.totalSeats), // শুরুতে ফুল সিট থাকবে
            dateTime: new Date(payload.dateTime), // স্ট্রিং থেকে ডেট অবজেক্ট
            organizerId: organizer.id,
            status: "UPCOMING", // ডিফল্ট স্ট্যাটাস
        },
    });

    return result;
};

/**
 * 2. Get all events with filtering and search
 */
const getAllEventsFromDB = async (filters: IEventFilterRequest) => {
    const { searchTerm, category, minPrice, maxPrice, status: eventStatus } = filters;
    
    const andConditions: Prisma.EventWhereInput[] = [];

    // Search logic (Title, Description, Venue, Location)
    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { venue: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    // Category filter
    if (category) {
        andConditions.push({ category });
    }

    // Status filter
    if (eventStatus) {
        andConditions.push({ status: eventStatus });
    }

    // Price range filter
    if (minPrice || maxPrice) {
        andConditions.push({
            ticketPrice: {
                gte: minPrice ? parseFloat(minPrice as string) : undefined,
                lte: maxPrice ? parseFloat(maxPrice as string) : undefined,
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
        orderBy: { dateTime: 'asc' }, // dateTime ফিল্ড অনুযায়ী সর্টিং
    });

    return result;
};

/**
 * 3. Get a single event by ID
 */
const getSingleEventFromDB = async (id: string) => {
    const result = await prisma.event.findUnique({
        where: { id },
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
            },
            coupons: true // কুপন থাকলে তাও দেখতে পাবেন
        },
    });

    if (!result || result.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Event not found!");
    }
    return result;
};

/**
 * 4. Update an event
 */
const updateEventIntoDB = async (eventId: string, userId: string, payload: Partial<IEventCreatePayload>) => {
    const event = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!event) {
        throw new AppError(status.FORBIDDEN, "Unauthorized or event not found!");
    }

    const result = await prisma.event.update({
        where: { id: eventId },
        data: {
            ...payload,
            // যদি dateTime আপডেট হয় তবে সেটি Date অবজেক্টে নিতে হবে
            ...(payload.dateTime && { dateTime: new Date(payload.dateTime) }),
            // যদি totalSeats আপডেট হয় তবে লজিক অনুযায়ী availableSeats চেক করা দরকার
            ...(payload.totalSeats && { availableSeats: Number(payload.totalSeats) })
        },
    });
    return result;
};

/**
 * 5. Soft delete an event
 */
const deleteEventFromDB = async (eventId: string, userId: string) => {
    const event = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!event) {
        throw new AppError(status.FORBIDDEN, "Unauthorized or event not found!");
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