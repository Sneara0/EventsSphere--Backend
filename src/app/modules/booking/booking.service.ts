// 📂 src/app/modules/booking/booking.service.ts

import { prisma } from "../../lib/prisma";
import {
  ICreateBookingRequest,
  IPaymentFulfillmentData,
  IUpdateBookingRequest,
} from './booking.interface';
import { sendEmailWithInvoice } from '../../utils/sendEmail';
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status";
// এনামগুলো সরাসরি প্রিজমা থেকে নিন
import { InvoiceService } from "../payment/invoice.service";
import { BookingStatus, PaymentStatus } from "src/generated/prisma/enums";

/**
 * 1. User: Create Initial Booking (Seat Reservation সহ)
 */
const createBookingIntoDB = async (userId: string, payload: ICreateBookingRequest) => {
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

    // ইভেন্টের অ্যাভেইলঅ্যাবল সিট কমিয়ে দেওয়া
    await tx.event.update({
      where: { id: payload.eventId },
      data: {
        availableSeats: {
          decrement: payload.quantity,
        },
      },
    });

    // বুকিং রেকর্ড তৈরি (PENDING অবস্থায়)
    const booking = await tx.booking.create({
      data: {
        userId,
        eventId: payload.eventId,
        quantity: payload.quantity,
        totalAmount: event.ticketPrice * payload.quantity,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
      include: {
        event: true
      }
    });

    return booking;
  });
};

/**
 * 2. Get Single Booking (Security Check সহ)
 */
const getSingleBookingFromDB = async (id: string, user: any) => {
  const result = await prisma.booking.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          title: true,
          ticketPrice: true,
          dateTime: true,
          location: true,
          thumbnail: true
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

  // 🔐 Access Control
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const isOwner = result.userId === user.userId;

  if (!isAdmin && !isOwner) {
    throw new AppError(httpStatus.FORBIDDEN, "Access Denied!");
  }

  return result;
};

/**
 * 3. Payment Fulfillment (পেমেন্ট সফল হওয়ার পর)
 */
const fulfillBookingAfterPayment = async (data: IPaymentFulfillmentData) => {
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

    // ১. বুকিং স্ট্যাটাস আপডেট
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

    // ২. পেমেন্ট রেকর্ড তৈরি
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

  // ৩. ইনভয়েস জেনারেশন ও ইমেইল (Background Task)
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
        return sendEmailWithInvoice(
          result.user.email,
          pdfBase64, 
          `Invoice_${result.id}.pdf`,
          result.user.name
        );
      })
      .catch((err) => console.error("❌ Background Task Error:", err));
  }

  return result;
};

/**
 * 4. User: নিজের বুকিং হিস্ট্রি
 */
const getMyBookingsFromDB = async (userId: string) => {
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
 * 5. Admin: সব বুকিং লিস্ট
 */
const getAllBookingsFromDB = async () => {
  return await prisma.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true, dateTime: true } },
      payment: true, 
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * 6. Cancel Booking (User/Admin)
 */
const cancelBookingFromDB = async (id: string, user: any) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new AppError(httpStatus.BAD_REQUEST, "Paid bookings cannot be canceled!");
    }

    // সিট ফিরিয়ে দেওয়া
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
 * 7. Admin: ডিলিট বুকিং
 */
const deleteBookingByAdmin = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");

    // ক্যানসেলড না হলে সিট ফেরত দিয়ে ডিলিট করা
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
 * 8. Admin: ম্যানুয়াল আপডেট
 */
const updateBookingStatusByAdmin = async (id: string, payload: IUpdateBookingRequest) => {
  const isExist = await prisma.booking.findUnique({ where: { id } });
  if (!isExist) throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");

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