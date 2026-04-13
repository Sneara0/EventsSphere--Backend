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

/**
 * ১. Stripe Checkout Session তৈরি করা
 */
const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, totalAmount, userEmail, userId, eventName } = req.body;

  console.log(`⏳ Creating session for Booking: ${bookingId}, Amount: ${totalAmount}`);

  const amount = Number(totalAmount);
  if (!amount || amount <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid payment amount!",
    });
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
          unit_amount: Math.round(amount * 100), // Stripe counts in cents/paisa
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
 * ২. Stripe Webhook হ্যান্ডলার (এটি ডাটাবেস আপডেট এবং ইমেইল পাঠাবে)
 */
const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const webhookSecret = config.STRIPE.STRIPE_WEBHOOK_SECRET; 
    
    // সিগনেচার ভেরিফাই (অবশ্যই raw body লাগবে যা app.ts থেকে আসছে)
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

  // পেমেন্ট সফল হলে এই ব্লকটি রান করবে
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { bookingId, userId } = session.metadata;

    if (!bookingId || !userId) {
      console.error("⚠️ Error: Missing metadata in Stripe session");
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      console.log(`🔄 Processing fulfillment for Booking: ${bookingId}...`);

      // ১. ডাটাবেস আপডেট (Status -> PAID এবং Booking -> SUCCESS)
      const bookingData = await PaymentService.fulfillOrder({
        transactionId: session.id,
        amount: session.amount_total / 100, 
        bookingId: bookingId,
        userId: userId,
      });

      if (bookingData) {
        // ২. ইনভয়েস PDF জেনারেট করা
        const pdfBase64 = await InvoiceService.generateInvoicePDF({
          userName: bookingData.user.name,
          userEmail: bookingData.user.email,
          bookingId: bookingData.id,
          eventName: bookingData.event.title,
          amount: bookingData.totalAmount,
          transactionId: session.id,
          date: new Date().toLocaleDateString(),
        });

        // ৩. ইনভয়েসসহ ইমেইল পাঠানো (অবশ্যই await দিতে হবে)
        await sendEmailWithInvoice(
          bookingData.user.email,
          pdfBase64,
          `Invoice_${bookingData.id}.pdf`,
          bookingData.user.name
        );

        console.log(`🚀 SUCCESS: Database Updated and Email Sent to ${bookingData.user.email}`);
      }
    } catch (error: any) {
      console.error('❌ Fulfillment Error:', error.message);
    }
  }

  // Stripe-কে জানানো যে আমরা ডাটা পেয়েছি
  res.json({ received: true });
};

export const PaymentController = {
  createPaymentSession,
  handleStripeWebhook,
};