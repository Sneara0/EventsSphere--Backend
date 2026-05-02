import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import { IEventCreatePayload, IEventFilterRequest } from "./event.interface.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// এআই কনফিগ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * ১. ইভেন্ট তৈরি (Create Event)
 */
const createEventIntoDB = async (userId: string, payload: IEventCreatePayload) => {
    // ইউজারের অর্গানাইজার প্রোফাইল আছে কি না চেক করা
    const organizer = await prisma.organizer.findUnique({
        where: { userId: userId }
    });

    if (!organizer) {
        throw new AppError(status.NOT_FOUND, "Organizer profile not found!");
    }

    // নতুন ইভেন্ট তৈরি
    const result = await prisma.event.create({
        data: {
            ...payload,
            organizerId: organizer.id,
            ticketPrice: Number(payload.ticketPrice), // টাইপ সেফটি নিশ্চিত করা
        }
    });

    return result;
};

/**
 * ২. এডমিন ড্যাশবোর্ড স্ট্যাটস
 */
const getEventStatsFromDB = async () => {
    const totalEvents = await prisma.event.count({ where: { isDeleted: false } });
    const totalBookings = await prisma.booking.count();
    
    // স্কিমা অনুযায়ী totalAmount সিলেক্ট করা হয়েছে
    const bookings = await prisma.booking.findMany({
        select: { createdAt: true, totalAmount: true }
    });

    const chartData = bookings.reduce((acc: any[], curr) => {
        const month = curr.createdAt.toLocaleString('default', { month: 'short' });
        const existing = acc.find((item) => item.name === month);
        
        if (existing) {
            existing.bookings += 1;
            // totalPrice এর বদলে totalAmount ব্যবহার করা হয়েছে
            existing.revenue += curr.totalAmount;
        } else {
            acc.push({ 
                name: month, 
                bookings: 1, 
                revenue: curr.totalAmount 
            });
        }
        return acc;
    }, []);

    return { totalEvents, totalBookings, chartData };
};

/**
 * ৩. এআই সার্চ সাজেশন
 */
const getAISuggestionsFromDB = async (searchTerm: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Suggest 3 professional search keywords for an event management platform related to "${searchTerm}". Output should be a single string with keywords separated by commas only. No numbering or extra text.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response.text(); // await যোগ করা হয়েছে
        return response.split(',').map((s: string) => s.trim()).filter(Boolean);
    } catch (error) {
        return ["Upcoming Events", "Trending Workshops", "Top Seminars"];
    }
};

/**
 * ৪. সার্চ, অ্যাডভান্সড ফিল্টার এবং পেজিনেশন
 */
const getAllEventsFromDB = async (filters: IEventFilterRequest) => {
    const { searchTerm, category, minPrice, maxPrice, status: eventStatus, page = 1, limit = 10 } = filters;
    const andConditions: Prisma.EventWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
                { category: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    if (category) andConditions.push({ category });
    
    // Status enum টাইপ এরর এড়াতে টাইপ কাস্টিং
    if (eventStatus) andConditions.push({ status: eventStatus as any });
    
    if (minPrice || maxPrice) {
        andConditions.push({
            ticketPrice: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined,
            },
        });
    }

    andConditions.push({ isDeleted: false });

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [result, total] = await Promise.all([
        prisma.event.findMany({
            where: { AND: andConditions },
            include: {
                organizer: {
                    include: { user: { select: { name: true, image: true } } }
                }
            },
            skip,
            take,
            orderBy: { dateTime: 'asc' }, 
        }),
        prisma.event.count({ where: { AND: andConditions } })
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / take)
        },
        data: result
    };
};

/**
 * ৫. সিঙ্গেল ইভেন্ট ভিউ
 */
const getSingleEventFromDB = async (id: string) => {
    const result = await prisma.event.findUnique({
        where: { id },
        include: { 
            organizer: { 
                include: { 
                    user: { select: { name: true, email: true, image: true } } 
                } 
            } 
        }
    });

    if (!result || result.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Event not found!");
    }
    return result;
};

/**
 * ৬. আপডেট ইভেন্ট
 */
const updateEventIntoDB = async (eventId: string, userId: string, payload: Partial<IEventCreatePayload>) => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError(status.NOT_FOUND, "Event not found!");

    // এখানে organizerId ভেরিফিকেশন করা উচিত যাতে অন্য কেউ ইভেন্ট আপডেট না করতে পারে
    return await prisma.event.update({
        where: { id: eventId },
        data: payload as any
    });
};

/**
 * ৭. ডিলিট ইভেন্ট
 */
const deleteEventFromDB = async (eventId: string, userId: string) => {
    // এখানেও ইউজার অথরাইজেশন চেক করা নিরাপদ
    return await prisma.event.update({
        where: { id: eventId },
        data: { isDeleted: true },
    });
};

// ফাইনাল এক্সপোর্ট
export const EventService = {
    createEventIntoDB,
    getAllEventsFromDB,
    getSingleEventFromDB,
    updateEventIntoDB,
    deleteEventFromDB,
    getEventStatsFromDB,
    getAISuggestionsFromDB
};