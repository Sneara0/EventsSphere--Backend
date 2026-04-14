// 📂 src/app/modules/payment/payment.controller.ts

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config/env.js';
import { PaymentService } from './payment.service.js';
import { InvoiceService } from './invoice.service.js';
import { sendEmailWithInvoice } from '../../utils/sendEmail.js';
import { stripe } from '../../../config/stripe.config.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { prisma } from '../../lib/prisma.js';
import AppError from '../../errorHelpers/AppError.js';

/**
 * ১. Stripe Checkout Session তৈরি করা
 */
const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, totalAmount, userEmail, userId, eventName } = req.body;

  const amount = Number(totalAmount);
  if (!amount || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment amount!");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: eventName || 'Event Ticket Booking',
            description: `Booking ID: ${bookingId}`,
          },
          unit_amount: Math.round(amount * 100), 
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

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment session created successfully',
    data: { id: session.id, url: session.url },
  });
});

/**
 * ২. Stripe Webhook হ্যান্ডলার (পেমেন্ট ভেরিফিকেশন)
 */
const handleStripeWebhook = async (req: Request, res: Response) => {
  // টাইপ এরর ফিক্স করতে 'as string' ব্যবহার করা হয়েছে
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const webhookSecret = config.STRIPE.STRIPE_WEBHOOK_SECRET; 
    
    if (!sig || !webhookSecret) {
      throw new Error("Missing stripe signature or webhook secret");
    }

    event = stripe.webhooks.constructEvent(
      req.body, 
      sig,
      webhookSecret
    );
    console.log("✅ Webhook Verified: ", event.type);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { bookingId, userId } = session.metadata;

    try {
      console.log(`🔄 Processing fulfillment for Booking: ${bookingId}...`);

      const bookingData = await PaymentService.fulfillOrder({
        transactionId: session.id,
        amount: session.amount_total / 100, 
        bookingId: bookingId,
        userId: userId,
      });

      if (bookingData) {
        // ইনভয়েস জেনারেট এবং ইমেইল পাঠানো
        const pdfBase64 = await InvoiceService.generateInvoicePDF({
          userName: (bookingData as any).user.name,
          userEmail: (bookingData as any).user.email,
          bookingId: (bookingData as any).id,
          eventName: (bookingData as any).event.title,
          amount: (bookingData as any).totalAmount,
          transactionId: session.id,
          date: new Date().toLocaleDateString(),
        });

        await sendEmailWithInvoice(
          (bookingData as any).user.email,
          pdfBase64,
          `Invoice_${(bookingData as any).id}.pdf`,
          (bookingData as any).user.name
        );

        console.log(`🚀 SUCCESS: Database Updated and Email Sent to ${(bookingData as any).user.email}`);
      }
    } catch (error: any) {
      console.error('❌ Fulfillment Error:', error.message);
    }
  }

  res.json({ received: true });
};

/**
 * ৩. ইনভয়েস ডাউনলোড করা (ড্যাশবোর্ড থেকে)
 */
const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  
  const id = Array.isArray(bookingId) ? bookingId[0] : bookingId;

  const bookingData = await prisma.booking.findUnique({
    where: { id },
    include: { 
      user: { select: { name: true, email: true } }, 
      event: { select: { title: true } } 
    }
  }) as any;

  if (!bookingData) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found!");
  }
  
  // পেমেন্ট পেইড না হলে ডাউনলোড করতে দিবে না
  if (bookingData.paymentStatus !== 'PAID') {
    throw new AppError(httpStatus.BAD_REQUEST, "Invoice is only available for paid bookings!");
  }

  const pdfBase64 = await InvoiceService.generateInvoicePDF({
    userName: bookingData.user.name,
    userEmail: bookingData.user.email,
    bookingId: bookingData.id,
    eventName: bookingData.event.title,
    amount: bookingData.totalAmount,
    transactionId: bookingData.transactionId || 'N/A',
    date: new Date(bookingData.updatedAt).toLocaleDateString(),
  });

  const pdfBuffer = Buffer.from(pdfBase64, 'base64');

  // সরাসরি ফাইল ডাউনলোড করার জন্য হেডার
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice_${bookingId}.pdf`);
  res.send(pdfBuffer);
});

export const PaymentController = {
  createPaymentSession,
  handleStripeWebhook,
  downloadInvoice,
};