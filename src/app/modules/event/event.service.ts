import status from "http-status";
import { prisma } from "../../lib/prisma";
import { IEventCreatePayload, IEventFilterRequest } from "./event.interface";
import AppError from "../../errorHelpers/AppError"; 
import { Prisma } from "src/generated/prisma/client";

/**
 * 1. Create a New Flight/Event Offer
 */
const createEventIntoDB = async (userId: string, payload: IEventCreatePayload) => {
    // অর্গানাইজার (ট্রাভেল এজেন্সি/অ্যাডমিন) প্রোফাইল চেক
    const organizer = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!organizer) {
        throw new AppError(status.NOT_FOUND, "Organizer profile not found!");
    }

    // ডাটাবেজে নতুন টিকেট অফার তৈরি
    const result = await prisma.event.create({
        data: {
            title: payload.title,
            description: payload.description,
            category: payload.category,
            location: payload.location, // Arrival City (e.g., Dubai)
            venue: payload.venue,       // Departure Airport (e.g., HSIA)
            time: payload.time,
            thumbnail: payload.thumbnail || null,
            ticketPrice: Number(payload.ticketPrice) || 0,
            totalSeats: Number(payload.totalSeats),
            availableSeats: Number(payload.totalSeats), 
            dateTime: new Date(payload.dateTime),
            organizerId: organizer.id,
            status: "UPCOMING",

            // --- এয়ার টিকিট স্পেসিফিক ডাটা ---
            airlineName: payload.airlineName || null,
            flightNumber: payload.flightNumber || null,
            flightClass: payload.flightClass || "ECONOMY",
            baggageAllowance: payload.baggageAllowance || null,
            isRefundable: payload.isRefundable ?? false,
        },
    });

    return result;
};

/**
 * 2. Get All Flight Offers (With Search & Filters)
 */
const getAllEventsFromDB = async (filters: IEventFilterRequest) => {
    const { searchTerm, category, minPrice, maxPrice, status: eventStatus, airlineName, flightClass } = filters;
    
    const andConditions: Prisma.EventWhereInput[] = [];

    // Search logic (এয়ারলাইন্স এবং লোকেশন দিয়েও সার্চ করা যাবে)
    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { venue: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
                { airlineName: { contains: searchTerm, mode: 'insensitive' } },
                { flightNumber: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    // ফিল্টারিং লজিক
    if (category) andConditions.push({ category });
    if (eventStatus) andConditions.push({ status: eventStatus });
    if (airlineName) andConditions.push({ airlineName: { contains: airlineName as string, mode: 'insensitive' } });
    if (flightClass) andConditions.push({ flightClass: flightClass as any });

    // প্রাইস রেঞ্জ ফিল্টার
    if (minPrice || maxPrice) {
        andConditions.push({
            ticketPrice: {
                gte: minPrice ? parseFloat(minPrice as string) : undefined,
                lte: maxPrice ? parseFloat(maxPrice as string) : undefined,
            },
        });
    }

    // শুধুমাত্র যেগুলো ডিলিট করা হয়নি
    andConditions.push({ isDeleted: false });

    return await prisma.event.findMany({
        where: { AND: andConditions },
        include: {
            organizer: {
                include: { 
                    user: { select: { name: true, image: true } } 
                }
            }
        },
        orderBy: { dateTime: 'asc' }, 
    });
};

/**
 * 3. Get Single Flight Details
 */
const getSingleEventFromDB = async (id: string) => {
    const result = await prisma.event.findUnique({
        where: { id },
        include: { 
            organizer: {
                include: { user: { select: { name: true, email: true, image: true } } }
            },
            reviews: {
                include: { user: { select: { name: true, image: true } } }
            },
            coupons: true 
        },
    });

    if (!result || result.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Flight offer not found!");
    }
    return result;
};

/**
 * 4. Update Flight/Event Info
 */
const updateEventIntoDB = async (eventId: string, userId: string, payload: Partial<IEventCreatePayload>) => {
    const event = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!event) {
        throw new AppError(status.FORBIDDEN, "Unauthorized or flight not found!");
    }

    const { dateTime, totalSeats, ...rest } = payload;

    return await prisma.event.update({
        where: { id: eventId },
        data: {
            ...rest,
            ...(dateTime && { dateTime: new Date(dateTime) }),
            ...(totalSeats && { 
                totalSeats: Number(totalSeats),
                availableSeats: Number(totalSeats) // সিট আপডেট হলে অ্যাভেইলেবল সিট রিসেট হবে
            })
        },
    });
};

/**
 * 5. Soft Delete Flight Offer
 */
const deleteEventFromDB = async (eventId: string, userId: string) => {
    const event = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!event) {
        throw new AppError(status.FORBIDDEN, "Unauthorized or flight not found!");
    }

    return await prisma.event.update({
        where: { id: eventId },
        data: { isDeleted: true },
    });
};

export const EventService = {
    createEventIntoDB,
    getAllEventsFromDB,
    getSingleEventFromDB,
    updateEventIntoDB,
    deleteEventFromDB
};