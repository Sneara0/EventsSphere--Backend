// 📂 src/app/modules/payment/payment.service.ts

import httpStatus from 'http-status';
import config from '../../../config/env.js';
import { IPaymentSessionPayload, IPaymentData } from './payment.interface.js';
import { stripe } from '../../../config/stripe.config.js';
import AppError from '../../errorHelpers/AppError.js';
import { prisma } from '../../lib/prisma.js';

// --- এই লাইনটি অত্যন্ত গুরুত্বপূর্ণ ---

import { BookingStatus, PaymentStatus } from '../../../generated/prisma/enums.js';
import { Prisma } from '../../../generated/prisma/client.js';

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
  // এখন Prisma.TransactionClient কাজ করবে
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

    // খ. বুকিং আপডেট
    const booking = await tx.booking.update({
      where: { id: data.bookingId },
      data: { 
        paymentStatus: PaymentStatus.PAID,
        status: BookingStatus.SUCCESS, 
        transactionId: data.transactionId 
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

    // গ. ইভেন্টের সিট কমানো
    await tx.event.update({
      where: { id: (booking as any).eventId }, 
      data: { 
        availableSeats: { 
          decrement: 1 
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