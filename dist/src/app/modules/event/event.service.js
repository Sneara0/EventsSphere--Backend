import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
// এআই কনফিগ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
/**
 * ১. ইভেন্ট তৈরি (Create Event)
 */
const createEventIntoDB = async (userId, payload) => {
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
    const bookings = await prisma.booking.findMany({
        select: { createdAt: true, totalPrice: true }
    });
    const chartData = bookings.reduce((acc, curr) => {
        const month = curr.createdAt.toLocaleString('default', { month: 'short' });
        const existing = acc.find((item) => item.name === month);
        if (existing) {
            existing.bookings += 1;
            existing.revenue += curr.totalPrice;
        }
        else {
            acc.push({ name: month, bookings: 1, revenue: curr.totalPrice });
        }
        return acc;
    }, []);
    return { totalEvents, totalBookings, chartData };
};
/**
 * ৩. এআই সার্চ সাজেশন
 */
const getAISuggestionsFromDB = async (searchTerm) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Suggest 3 professional search keywords for an event management platform related to "${searchTerm}". Output should be a single string with keywords separated by commas only. No numbering or extra text.`;
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return response.split(',').map((s) => s.trim()).filter(Boolean);
    }
    catch (error) {
        return ["Upcoming Events", "Trending Workshops", "Top Seminars"];
    }
};
/**
 * ৪. সার্চ, অ্যাডভান্সড ফিল্টার এবং পেজিনেশন
 */
const getAllEventsFromDB = async (filters) => {
    const { searchTerm, category, minPrice, maxPrice, status: eventStatus, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
                { category: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }
    if (category)
        andConditions.push({ category });
    if (eventStatus)
        andConditions.push({ status: eventStatus });
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
const getSingleEventFromDB = async (id) => {
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
const updateEventIntoDB = async (eventId, userId, payload) => {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event)
        throw new AppError(status.NOT_FOUND, "Event not found!");
    return await prisma.event.update({
        where: { id: eventId },
        data: payload
    });
};
/**
 * ৭. ডিলিট ইভেন্ট
 */
const deleteEventFromDB = async (eventId, userId) => {
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
