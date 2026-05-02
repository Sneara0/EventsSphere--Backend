// 📂 src/app/modules/booking/booking.service.ts
import { prisma } from "../../lib/prisma.js";
import { sendEmailWithInvoice } from '../../utils/sendEmail.js';
import AppError from "../../errorHelpers/AppError.js";
import httpStatus from "http-status";
import { InvoiceService } from "../payment/invoice.service.js";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums.js";
/**
 * 1. Create Initial Booking
 */
const createBookingIntoDB = async (userId, payload) => {
    return await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
            where: { id: payload.eventId, isDeleted: false },
        });
        if (!event) {
            throw new AppError(httpStatus.NOT_FOUND, "Event not found!");
        }
        if (event.availableSeats < payload.quantity) {
            throw new AppError(httpStatus.BAD_REQUEST, "Insufficient seats available!");
        }
        await tx.event.update({
            where: { id: payload.eventId },
            data: {
                availableSeats: { decrement: payload.quantity },
            },
        });
        const booking = await tx.booking.create({
            data: {
                userId,
                eventId: payload.eventId,
                quantity: payload.quantity,
                totalAmount: event.ticketPrice * payload.quantity,
                status: BookingStatus.PENDING,
                paymentStatus: PaymentStatus.UNPAID,
            },
            include: { event: true }
        });
        return booking;
    });
};
/**
 * 2. Get Single Booking (FIXED: Access Denied Issue)
 */
const getSingleBookingFromDB = async (id, user) => {
    const result = await prisma.booking.findUnique({
        where: { id },
        include: {
            event: {
                include: {
                    organizer: true, // অর্গানাইজার চেক করার জন্য এটি দরকার
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
    });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking details not found!");
    }
    // --- 🔐 শক্তিশালী এক্সেস কন্ট্রোল ---
    const currentUserId = user.userId || user.id; // বিভিন্ন সোর্স থেকে আইডি হ্যান্ডেল করা
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isOwner = result.userId === currentUserId;
    const isOrganizerOfThisEvent = result.event.organizer?.userId === currentUserId;
    // Debugging (Console-এ চেক করার জন্য)
    console.log(`🔐 Access Check for Booking: ${id}`);
    console.log(`User: ${currentUserId}, Role: ${user.role}, isOwner: ${isOwner}, isOrg: ${isOrganizerOfThisEvent}`);
    if (!isAdmin && !isOwner && !isOrganizerOfThisEvent) {
        throw new AppError(httpStatus.FORBIDDEN, "Access Denied! You are not authorized to view this booking.");
    }
    return result;
};
/**
 * 3. Payment Fulfillment
 */
const fulfillBookingAfterPayment = async (data) => {
    const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
            where: { id: data.bookingId },
        });
        if (!booking) {
            throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
        }
        if (booking.paymentStatus === PaymentStatus.PAID) {
            throw new AppError(httpStatus.BAD_REQUEST, "Payment already completed!");
        }
        const updatedBooking = await tx.booking.update({
            where: { id: data.bookingId },
            data: {
                paymentStatus: PaymentStatus.PAID,
                status: BookingStatus.SUCCESS,
                transactionId: data.transactionId,
            },
            include: {
                user: { select: { name: true, email: true } },
                event: { select: { title: true, dateTime: true, location: true } }
            }
        });
        await tx.payment.create({
            data: {
                transactionId: data.transactionId,
                amount: data.amount,
                bookingId: data.bookingId,
                userId: data.userId,
                paymentStatus: PaymentStatus.PAID,
                currency: 'bdt',
                paymentMethod: 'stripe',
                invoiceUrl: data.invoiceUrl || null,
            },
        });
        return updatedBooking;
    });
    if (result) {
        const invoiceData = {
            userName: result.user.name,
            userEmail: result.user.email,
            bookingId: result.id,
            transactionId: data.transactionId,
            eventName: result.event.title,
            amount: data.amount,
            date: new Date().toLocaleDateString(),
        };
        InvoiceService.generateInvoicePDF(invoiceData)
            .then((pdfBase64) => {
            return sendEmailWithInvoice(result.user.email, pdfBase64, `Invoice_${result.id}.pdf`, result.user.name);
        })
            .catch((err) => console.error("❌ Background Task Error:", err));
    }
    return result;
};
/**
 * 4. User: Booking History
 */
const getMyBookingsFromDB = async (userId) => {
    return await prisma.booking.findMany({
        where: { userId },
        include: {
            event: {
                select: { title: true, dateTime: true, thumbnail: true, location: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    });
};
/**
 * 5. Admin: All Bookings
 */
const getAllBookingsFromDB = async () => {
    return await prisma.booking.findMany({
        include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true, dateTime: true } },
            payments: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};
/**
 * 6. Cancel Booking
 */
const cancelBookingFromDB = async (id, user) => {
    const currentUserId = user.userId || user.id;
    return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({ where: { id } });
        if (!booking)
            throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
        // Permission check for cancel
        if (booking.userId !== currentUserId && user.role !== 'ADMIN') {
            throw new AppError(httpStatus.FORBIDDEN, "You cannot cancel someone else's booking!");
        }
        if (booking.paymentStatus === PaymentStatus.PAID) {
            throw new AppError(httpStatus.BAD_REQUEST, "Paid bookings cannot be canceled!");
        }
        await tx.event.update({
            where: { id: booking.eventId },
            data: { availableSeats: { increment: booking.quantity } },
        });
        return await tx.booking.update({
            where: { id },
            data: { status: BookingStatus.CANCELLED }
        });
    });
};
/**
 * 7. Admin: Delete Booking
 */
const deleteBookingByAdmin = async (id) => {
    return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({ where: { id } });
        if (!booking)
            throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
        if (booking.status !== BookingStatus.CANCELLED) {
            await tx.event.update({
                where: { id: booking.eventId },
                data: { availableSeats: { increment: booking.quantity } },
            });
        }
        return await tx.booking.delete({ where: { id } });
    });
};
/**
 * 8. Admin: Update Status
 */
const updateBookingStatusByAdmin = async (id, payload) => {
    const isExist = await prisma.booking.findUnique({ where: { id } });
    if (!isExist)
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
    return await prisma.booking.update({
        where: { id },
        data: payload,
    });
};
export const BookingService = {
    createBookingIntoDB,
    getSingleBookingFromDB,
    fulfillBookingAfterPayment,
    getMyBookingsFromDB,
    getAllBookingsFromDB,
    cancelBookingFromDB,
    deleteBookingByAdmin,
    updateBookingStatusByAdmin,
};
