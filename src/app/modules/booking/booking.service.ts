// 📂 src/app/modules/booking/booking.service.ts

import { prisma } from "../../lib/prisma"; 
import { 
  ICreateBookingRequest, 
  IUpdateBookingRequest, 
  IPaymentFulfillmentData 
} from './booking.interface';
import { sendEmailWithInvoice } from '../../utils/sendEmail';
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status";
import { BookingStatus, PaymentStatus } from "src/generated/prisma/enums";

/**
 * 1. User: Create Initial Booking
 */
const createBookingIntoDB = async (userId: string, payload: ICreateBookingRequest) => {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: payload.eventId },
    });

    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, "Event not found!");
    }

    if (event.availableSeats < payload.quantity) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient seats available!");
    }

    const booking = await tx.booking.create({
      data: {
        userId,
        eventId: payload.eventId,
        quantity: payload.quantity,
        totalAmount: event.ticketPrice * payload.quantity,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    return booking;
  });
};

/**
 * 2. Payment Fulfillment: Update Stats, Create Payment & Send PDF Invoice
 */
const fulfillBookingAfterPayment = async (data: IPaymentFulfillmentData) => {
  const result = await prisma.$transaction(async (tx) => {
    
    const booking = await tx.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking || booking.paymentStatus === PaymentStatus.PAID) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid booking or already processed!");
    }

    const updatedBooking = await tx.booking.update({
      where: { id: data.bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: BookingStatus.SUCCESS,
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
      },
    });

    await tx.event.update({
      where: { id: updatedBooking.eventId },
      data: {
        availableSeats: {
          decrement: updatedBooking.quantity,
        },
      },
    });

    return updatedBooking;
  });

  // E. Background Task: ইমেইল পাঠানো
  if (result) {
    const emailData = result as any; // Type mismatch দূর করার জন্য কাস্টিং
    
    // মনে রাখবেন: এখানে ২য় প্যারামিটার হিসেবে PDF এর Base64 ডাটা লাগবে। 
    // আপাতত আমি খালি স্ট্রিং "" দিচ্ছি যাতে এরর না আসে। 
    // আসল PDF জেনারেট করলে সেই ভ্যালুটা এখানে বসাবেন।
    
    sendEmailWithInvoice(
      emailData.user.email,             // to
      "",                               // pdfBase64 (এখানে PDF ডাটা বসবে)
      `Invoice_${result.id}.pdf`,         // fileName
      emailData.user.name               // userName
    ).catch((err) => {
      console.error("❌ Failed to send invoice email:", err);
    });
  }

  return result;
};

/**
 * 3. Admin: Get All Bookings
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
 * 4. Admin: Manual Status Update
 */
const updateBookingStatusByAdmin = async (id: string, payload: IUpdateBookingRequest) => {
  return await prisma.booking.update({
    where: { id },
    data: payload,
  });
};

/**
 * 5. Admin: Delete & Restore Seats
 */
const deleteBookingByAdmin = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");

    if (booking.status === BookingStatus.SUCCESS || booking.paymentStatus === PaymentStatus.PAID) {
      await tx.event.update({
        where: { id: booking.eventId },
        data: { availableSeats: { increment: booking.quantity } },
      });
    }

    return await tx.booking.delete({ where: { id } });
  });
};

/**
 * 6. User: Personal History
 */
const getMyBookingsFromDB = async (userId: string) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const BookingService = {
  createBookingIntoDB,
  fulfillBookingAfterPayment,
  getAllBookingsFromDB,
  updateBookingStatusByAdmin,
  deleteBookingByAdmin,
  getMyBookingsFromDB,
};