// 📂 src/app/modules/payment/payment.service.ts

import httpStatus from 'http-status';
import env from 'src/config/env';
import { IPaymentSessionPayload, IPaymentData } from './payment.interface';
import { stripe } from 'src/config/stripe.config';
import AppError from 'src/app/errorHelpers/AppError';
import { prisma } from 'src/app/lib/prisma';
import { PaymentStatus, BookingStatus } from 'src/generated/prisma/enums';

/**
 * ১. Stripe Checkout Session তৈরি করা (BDT কারেন্সিতে)
 */
const createCheckoutSession = async (payload: IPaymentSessionPayload) => {
  const { bookingId, userId, amount, eventName, userEmail } = payload;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt', 
            product_data: {
              name: eventName,
              description: `Confirmation for Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100), // টাকা থেকে পয়সায় রূপান্তর
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
      customer_email: userEmail,
      metadata: {
        bookingId,
        userId,
      },
    });

    return session.url; 
  } catch (error: any) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Stripe Error: ${error.message}`);
  }
};

/**
 * ২. পেমেন্ট সফল হওয়ার পর অর্ডার ফুলফিল করা (Atomic Transaction)
 */
const fulfillOrder = async (data: IPaymentData) => {
  return await prisma.$transaction(async (tx) => {
    
    // ক. পেমেন্ট রেকর্ড তৈরি (আপনার নতুন স্কিমা অনুযায়ী)
    await tx.payment.create({
      data: {
        transactionId: data.transactionId,
        amount: data.amount,
        currency: 'bdt',
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: data.paymentMethod || 'stripe',
        bookingId: data.bookingId,
        userId: data.userId,
      },
    });

    // খ. বুকিং আপডেট (Status & PaymentStatus)
    const booking = await tx.booking.update({
      where: { id: data.bookingId },
      data: { 
        paymentStatus: PaymentStatus.PAID,
        status: BookingStatus.SUCCESS, // বুকিং এখন সফল
        transactionId: data.transactionId // বুকিং টেবিলেও আইডি রাখা ভালো
      },
      include: { 
        event: {
            select: { title: true, dateTime: true, location: true, id: true }
        }, 
        user: {
            select: { name: true, email: true }
        } 
      }
    });

    /** * নোট: যদি BookingService-এ ইভেন্ট ক্রিয়েট করার সময় সিট কমিয়ে থাকেন, 
     * তবে এখানে পুনরায় decrement করার প্রয়োজন নেই। 
     * অন্যথায় নিচের অংশটি আনকমেন্ট করুন:
     */
    /*
    await tx.event.update({
      where: { id: booking.eventId },
      data: { availableSeats: { decrement: booking.quantity } }
    });
    */

    return booking; 
  });
};

export const PaymentService = {
  createCheckoutSession,
  fulfillOrder,
};