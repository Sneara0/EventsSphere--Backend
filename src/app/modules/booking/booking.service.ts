import path from 'path';
import fs from 'fs';
import status from 'http-status';
import { prisma } from "../../lib/prisma";
import { IBookingCreatePayload } from "./booking.interface";
import { generateTicketPDF } from '../../utils/pdfGenerator';
import { uploadPDFToCloudinary } from '../../utils/cloudinary.utils';
import AppError from 'src/app/errorHelpers/AppError';
import { BookingStatus, PaymentStatus } from 'src/generated/prisma/enums';

/**
 * ১. নতুন বুকিং তৈরি করা (Transaction + PDF Generation)
 */
const createBookingIntoDB = async (userId: string, payload: IBookingCreatePayload) => {
    const { eventId, quantity = 1 } = payload;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        throw new AppError(status.NOT_FOUND, "Event not found!");
    }

    if (event.availableSeats < quantity) {
        throw new AppError(status.BAD_REQUEST, "Not enough seats available!");
    }

    // Prisma Transaction: বুকিং তৈরি এবং সিট কমানো
    const result = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
            data: {
                userId,
                eventId,
                totalAmount: event.ticketPrice * quantity,
                status: BookingStatus.SUCCESS, 
                paymentStatus: PaymentStatus.PAID, 
            },
            include: {
                event: true,
                user: true
            }
        });

        await tx.event.update({
            where: { id: eventId },
            data: {
                availableSeats: {
                    decrement: quantity
                }
            }
        });

        return newBooking;
    });

    // --- PDF Generation & Upload (Background Process) ---
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `ticket-${result.id}.pdf`);

    try {
        await generateTicketPDF(result, filePath);
        const cloudinaryUrl = await uploadPDFToCloudinary(filePath, 'event_tickets');

        if (cloudinaryUrl) {
            await prisma.booking.update({
                where: { id: result.id },
                data: {
                    ticketUrl: cloudinaryUrl,
                    isTicketGenerated: true,
                },
            });
            result.ticketUrl = cloudinaryUrl;
        }
    } catch (error) {
        console.error("Ticket Process Failed:", error);
    }

    return result;
};

/**
 * ২. ইউজারের নিজের সব বুকিং দেখা
 */
const getMyBookingsFromDB = async (userId: string) => {
    return await prisma.booking.findMany({
        where: { userId },
        include: {
            event: {
                include: {
                    organizer: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

/**
 * ৩. বুকিং ডিলিট/ক্যানসেল করা এবং সিট ফেরত দেওয়া
 */
const deleteBookingFromDB = async (userId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found!");
    }

    // নিশ্চিত করা যে ইউজার নিজের বুকিং ডিলিট করছে
    if (booking.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "Unauthorized access!");
    }

    await prisma.$transaction(async (tx) => {
        // বুকিং ডিলিট করা
        await tx.booking.delete({
            where: { id: bookingId },
        });

        // ইভেন্টের সিট সংখ্যা ফেরত দেওয়া
        await tx.event.update({
            where: { id: booking.eventId },
            data: {
                availableSeats: {
                    increment: 1 // বা আপনার logic অনুযায়ী booking.quantity
                }
            }
        });
    });

    return { message: "Booking deleted successfully and seat restored" };
};

// ফাইনাল এক্সপোর্ট অবজেক্ট
export const BookingService = {
    createBookingIntoDB,
    getMyBookingsFromDB,
    deleteBookingFromDB,
};