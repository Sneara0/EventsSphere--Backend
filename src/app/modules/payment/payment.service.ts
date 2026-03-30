import httpStatus from 'http-status';

import env from 'src/config/env';


import { IPaymentSessionPayload, IPaymentData } from './payment.interface';
import { stripe } from 'src/config/stripe.config';
import AppError from 'src/app/errorHelpers/AppError';
import { prisma } from 'src/app/lib/prisma';

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
            currency: 'bdt', // কারেন্সি টাকা (BDT) সেট করা হয়েছে
            product_data: {
              name: eventName,
              description: `Booking for: ${eventName}`,
            },
            unit_amount: Math.round(amount * 100), // টাকা থেকে পয়সায় রূপান্তর
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
      customer_email: userEmail,
      
      // মেটাডাটা: এটি Webhook-এ ফেরত আসবে ডাটাবেস আপডেট করার জন্য
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
 * ২. পেমেন্ট সফল হওয়ার পর অর্ডার ফুলফিল করা (Atomic Transaction)
 * এখানে পেমেন্ট সেভ হবে, বুকিং আপডেট হবে এবং সিট ১টি কমবে।
 */
const fulfillOrder = async (data: IPaymentData) => {
  return await prisma.$transaction(async (tx) => {
    
    // ক. পেমেন্ট টেবিলে নতুন রেকর্ড তৈরি
    await tx.payment.create({
      data: {
        transactionId: data.transactionId,
        amount: data.amount,
        currency: 'bdt',
        paymentStatus: 'PAID',
        paymentMethod: data.paymentMethod || 'card',
        bookingId: data.bookingId,
        userId: data.userId,
      },
    });

    // খ. বুকিং আপডেট এবং ইভেন্ট ও ইউজার ডাটা রিট্রিভ করা
    const booking = await tx.booking.update({
      where: { id: data.bookingId },
      data: { paymentStatus: 'PAID' },
      include: { 
        event: true, 
        user: true 
      }
    });

    // গ. ইভেন্টের Available Seats ১ কমিয়ে দেওয়া
    // এটি নিশ্চিত করবে যে টিকিট কাটার পর সিট সংখ্যা আপডেট হয়েছে
    await tx.event.update({
      where: { id: booking.eventId },
      data: {
        availableSeats: {
          decrement: 1
        }
      }
    });

    return booking; // এটি কন্ট্রোলারে পাঠানো হবে ইনভয়েস ও ইমেইল পাঠানোর জন্য
  });
};

export const PaymentService = {
  createCheckoutSession,
  fulfillOrder,
};