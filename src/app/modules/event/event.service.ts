import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import { IEventCreatePayload, IEventFilterRequest } from "./event.interface.js";
import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";



/**
 * 1. নতুন ফ্লাইট/ইভেন্ট অফার তৈরি করা
 */
const createEventIntoDB = async (userId: string, payload: IEventCreatePayload) => {
    // --- DEBUG LOG ---
    console.log("🔍 Checking Organizer for UserId:", userId);

    // অর্গানাইজার প্রোফাইল চেক
    const organizer = await prisma.organizer.findUnique({
        where: { userId },
    });

    if (!organizer) {
        console.error("❌ Organizer not found in DB for UserId:", userId);
        throw new AppError(status.NOT_FOUND, "Organizer profile not found! Please create an organizer profile first.");
    }

    console.log("✅ Organizer Found:", organizer.id);

    // ডাটা কাস্টিং নিশ্চিত করা
    const totalSeatsCount = Number(payload.totalSeats);
    const ticketPriceAmount = Number(payload.ticketPrice);

    // ডেট ফরম্যাট চেক করা (যদি ভুল ফরম্যাট আসে তবে NaN হ্যান্ডেল করা)
    const eventDate = new Date(payload.dateTime);
    if (isNaN(eventDate.getTime())) {
        throw new AppError(status.BAD_REQUEST, "Invalid date and time format!");
    }

    try {
        const result = await prisma.event.create({
            data: {
                title: payload.title,
                description: payload.description,
                category: payload.category,
                location: payload.location, 
                venue: payload.venue,       
                time: payload.time,
                thumbnail: payload.thumbnail || null,
                ticketPrice: ticketPriceAmount || 0,
                totalSeats: totalSeatsCount,
                availableSeats: totalSeatsCount, 
                dateTime: eventDate,
                organizerId: organizer.id,
                status: "UPCOMING",

                // এয়ার টিকিট স্পেসিফিক ডাটা
                airlineName: payload.airlineName || null,
                flightNumber: payload.flightNumber || null,
                flightClass: (payload.flightClass as any) || "ECONOMY",
                baggageAllowance: payload.baggageAllowance || null,
                isRefundable: payload.isRefundable === true || (payload.isRefundable as any) === 'true',
            },
        });

        console.log("🚀 Event Created Successfully:", result.id);
        return result;
    } catch (error) {
        // 🔥 এই লগটি আপনাকে বলে দিবে আসলে প্রিজমা কেন এরর দিচ্ছে
        console.error("🔥 Prisma Create Error:", error);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create event in database!");
    }
};

/**
 * 2. সার্চ এবং ফিল্টারসহ সব ফ্লাইট অফার পাওয়া
 */
const getAllEventsFromDB = async (filters: IEventFilterRequest) => {
    const { searchTerm, category, minPrice, maxPrice, status: eventStatus, airlineName, flightClass } = filters;
    
    const andConditions: Prisma.EventWhereInput[] = [];

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

    if (category) andConditions.push({ category });
    if (eventStatus) andConditions.push({ status: eventStatus as any });
    
    if (airlineName) {
        andConditions.push({ 
            airlineName: { contains: airlineName as string, mode: 'insensitive' } 
        });
    }
    if (flightClass) {
        andConditions.push({ flightClass: flightClass as any });
    }

    if (minPrice || maxPrice) {
        andConditions.push({
            ticketPrice: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined,
            },
        });
    }

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
 * 3. সিঙ্গেল ফ্লাইট ডিটেইলস পাওয়া
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
            }
        },
    });

    if (!result || result.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Flight offer not found!");
    }
    return result;
};

/**
 * 4. ফ্লাইট তথ্য আপডেট করা
 */
const updateEventIntoDB = async (eventId: string, userId: string, payload: Partial<IEventCreatePayload>) => {
    const isExist = await prisma.event.findFirst({
        where: { id: eventId, organizer: { userId }, isDeleted: false }
    });

    if (!isExist) {
        throw new AppError(status.FORBIDDEN, "Unauthorized or flight not found!");
    }

    const { dateTime, totalSeats, ticketPrice, isRefundable, ...rest } = payload;
    const updateData: any = { ...rest };

    if (dateTime) updateData.dateTime = new Date(dateTime);
    if (ticketPrice !== undefined) updateData.ticketPrice = Number(ticketPrice);
    if (isRefundable !== undefined) {
        updateData.isRefundable = isRefundable === true || (isRefundable as any) === 'true';
    }
    
    if (totalSeats !== undefined) {
        const newTotalSeats = Number(totalSeats);
        const bookedSeats = isExist.totalSeats - isExist.availableSeats;
        
        updateData.totalSeats = newTotalSeats;
        updateData.availableSeats = newTotalSeats - bookedSeats;

        if (updateData.availableSeats < 0) {
            throw new AppError(status.BAD_REQUEST, "Total seats cannot be less than already booked seats!");
        }
    }

    return await prisma.event.update({
        where: { id: eventId },
        data: updateData
    });
};

/**
 * 5. ফ্লাইট ডিলিট (Soft Delete)
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