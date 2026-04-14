

import httpStatus from 'http-status';
import config from '../../../config/env.js';
import { IPaymentSessionPayload, IPaymentData } from './payment.interface.js';
import { stripe } from '../../../config/stripe.config.js';
import AppError from '../../errorHelpers/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { BookingStatus, PaymentStatus } from '../../../generated/prisma/enums.js';
import { Prisma } from '../../../generated/prisma/client.js';

/**
 * ১. Stripe Checkout Session তৈরি করা
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
              name: eventName || 'Event Booking',
              description: `Confirmation for Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(Number(amount) * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${config.FRONTEND_URL}/checkout/${bookingId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.FRONTEND_URL}/checkout/${bookingId}?status=cancelled`,
      customer_email: userEmail,
      metadata: {
        bookingId: String(bookingId),
        userId: String(userId),
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
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    
    // ক. পেমেন্ট রেকর্ড তৈরি
    await tx.payment.create({
      data: {
        transactionId: data.transactionId,
        amount: Number(data.amount),
        currency: 'bdt',
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: data.paymentMethod || 'stripe',
        bookingId: data.bookingId,
        userId: data.userId,
      },
    });

    // খ. বুকিং আপডেট করা এবং প্রয়োজনীয় ডাটা include করা
    const booking = await tx.booking.update({
      where: { id: data.bookingId },
      data: { 
        paymentStatus: PaymentStatus.PAID,
        status: BookingStatus.SUCCESS, 
        transactionId: data.transactionId 
      },
      include: { 
        event: {
          select: { id: true, title: true, dateTime: true, location: true }
        }, 
        user: {
          select: { name: true, email: true }
        } 
      }
    });

    // গ. ইভেন্টের সিট কমানো (সরাসরি booking.eventId ব্যবহার করুন)
    await tx.event.update({
      where: { id: booking.eventId }, 
      data: { 
        availableSeats: { 
          decrement: booking.quantity || 1 // ১টি বা বুকিং এর সমপরিমাণ সিট কমানো
        } 
      }
    });

    return booking; 
  });
};

export const PaymentService = {
  createCheckoutSession,
  fulfillOrder,
};