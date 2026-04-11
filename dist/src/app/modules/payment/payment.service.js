// 📂 src/app/modules/payment/payment.service.ts
import httpStatus from 'http-status';
import config from '../../../config/env'; // কন্ট্রোলারের সাথে পাথ সিঙ্ক করা হলো
import { stripe } from '../../../config/stripe.config';
import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';
import { BookingStatus, PaymentStatus } from '../../../generated/prisma/enums';
// সরাসরি প্রিজমা ক্লায়েন্ট থেকে এনাম নিন
/**
 * ১. Stripe Checkout Session তৈরি করা (BDT কারেন্সিতে)
 */
const createCheckoutSession = async (payload) => {
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
                        unit_amount: Math.round(Number(amount) * 100), // টাকা থেকে পয়সায় রূপান্তর
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // ফ্রন্টএন্ডের সাকসেস পেজের পাথ ঠিক করে নিন
            success_url: `${config.FRONTEND_URL}/checkout/${bookingId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.FRONTEND_URL}/checkout/${bookingId}?status=cancelled`,
            customer_email: userEmail,
            metadata: {
                bookingId: String(bookingId),
                userId: String(userId),
            },
        });
        return session.url;
    }
    catch (error) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Stripe Error: ${error.message}`);
    }
};
/**
 * ২. পেমেন্ট সফল হওয়ার পর অর্ডার ফুলফিল করা (Atomic Transaction)
 */
const fulfillOrder = async (data) => {
    return await prisma.$transaction(async (tx) => {
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
        // খ. বুকিং আপডেট (Status & PaymentStatus)
        // নোট: আপনার ফ্রন্টএন্ডে 'PAID' চেক করলে BookingStatus.PAID দিন (যদি এনামে থাকে)
        // অন্যথায় BookingStatus.SUCCESS ই রাখুন কিন্তু ফ্রন্টএন্ডে এটি হ্যান্ডেল করুন
        const booking = await tx.booking.update({
            where: { id: data.bookingId },
            data: {
                paymentStatus: PaymentStatus.PAID,
                status: BookingStatus.SUCCESS, // অথবা BookingStatus.PAID আপনার এনাম অনুযায়ী
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
        // গ. ইভেন্টের সিট কমানো (Atomic Update)
        await tx.event.update({
            where: { id: booking.eventId },
            data: {
                availableSeats: {
                    decrement: 1 // বা booking.quantity যদি থাকে
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
