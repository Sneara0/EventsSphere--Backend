import { prisma } from "../../lib/prisma";
/**
 * ১. অ্যাডমিন স্ট্যাটাস: পুরো সিস্টেমের ওভারভিউ
 */
const getAdminStats = async () => {
    const [userCounts, eventStats, revenueStats, topSellingEvents] = await Promise.all([
        // রোল অনুযায়ী ইউজার সংখ্যা (Admin, Organizer, Participant)
        prisma.user.groupBy({ by: ['role'], _count: true }),
        // ইভেন্ট স্ট্যাটাস (Active, Pending, etc.)
        prisma.event.groupBy({ by: ['status'], _count: true }),
        // মোট পেমেন্ট সাকসেস এবং রেভিনিউ
        prisma.booking.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalAmount: true },
            _count: { id: true },
        }),
        // সেরা ৫টি ইভেন্ট (বুকিং সংখ্যার ওপর ভিত্তি করে)
        prisma.event.findMany({
            take: 5,
            orderBy: {
                bookings: {
                    _count: 'desc',
                },
            },
            select: {
                id: true,
                title: true,
                _count: {
                    select: { bookings: { where: { paymentStatus: 'PAID' } } },
                },
            },
        }),
    ]);
    return {
        userCounts,
        eventStats,
        revenueStats,
        topSellingEvents
    };
};
/**
 * ২. অর্গানাইজার স্ট্যাটাস: তার নিজের ইভেন্টগুলোর পারফরম্যান্স
 */
const getOrganizerStats = async (organizerId) => {
    const events = await prisma.event.findMany({
        where: { organizerId },
        include: {
            _count: { select: { bookings: { where: { paymentStatus: 'PAID' } } } },
            bookings: { where: { paymentStatus: 'PAID' }, select: { totalAmount: true } },
            reviews: { select: { rating: true } }
        }
    });
    const totalSales = events.reduce((acc, curr) => acc + curr._count.bookings, 0);
    const totalEarnings = events.reduce((acc, curr) => acc + curr.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0), 0);
    const eventPerformance = events.map(event => ({
        id: event.id,
        title: event.title,
        sales: event._count.bookings,
        avgRating: event.reviews.length > 0
            ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
            : 0
    }));
    return { totalEvents: events.length, totalSales, totalEarnings, eventPerformance };
};
/**
 * ৩. ইউজার স্ট্যাটাস: তার ব্যক্তিগত ইভেন্ট ও খরচ
 */
const getUserStats = async (userId) => {
    const now = new Date();
    const [upcoming, past, spending, reviews] = await Promise.all([
        // আপকামিং ইভেন্টসমূহ
        prisma.booking.findMany({
            where: { userId, paymentStatus: 'PAID', event: { dateTime: { gte: now } } },
            include: { event: true }
        }),
        // গত হয়ে যাওয়া ইভেন্টসমূহ
        prisma.booking.findMany({
            where: { userId, paymentStatus: 'PAID', event: { dateTime: { lt: now } } },
            include: { event: true }
        }),
        // মোট কত টাকা খরচ হলো
        prisma.booking.aggregate({
            where: { userId, paymentStatus: 'PAID' },
            _sum: { totalAmount: true }
        }),
        // ইউজারের দেওয়া সব রিভিউ
        prisma.review.findMany({
            where: { userId },
            include: { event: { select: { title: true } } }
        })
    ]);
    return {
        upcomingEvents: upcoming,
        pastEvents: past,
        totalSpent: spending._sum.totalAmount || 0,
        myReviews: reviews
    };
};
export const DashboardService = {
    getAdminStats,
    getOrganizerStats,
    getUserStats
};
