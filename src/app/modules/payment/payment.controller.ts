// 📂 src/app/modules/payment/payment.controller.ts

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config/env.js'; 
import { PaymentService } from './payment.service.js';
import { InvoiceService } from './invoice.service.js';
import { sendEmailWithInvoice } from '../../utils/sendEmail.js';
import { stripe } from '../../../config/stripe.config.js';
import { catchAsync } from '../../utils/catchAsync.js'; // পাথ ঠিক করে নিন
import { sendResponse } from '../../utils/sendResponse.js'; // পাথ ঠিক করে নিন

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, totalAmount, userEmail, userId, eventName } = req.body;

  // ১. ডিবাগিং লগ (টার্মিনালে চেক করবেন ডাটা আসছে কি না)
  console.log(`⏳ Creating session for Booking: ${bookingId}, Amount: ${totalAmount}`);

  // ২. অ্যামাউন্ট ভ্যালিডেশন (অবশ্যই নাম্বার হতে হবে)
  const amount = Number(totalAmount);
  if (!amount || amount <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid payment amount received!",
    });
  }

  // ৩. Stripe সেশন তৈরি
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
          // ✅ Stripe সেন্ট/পয়সা হিসেবে হিসাব করে, তাই ১০০ দিয়ে গুণ
          unit_amount: Math.round(amount * 100), 
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // ৪. ফ্রন্টএন্ডের চেকআউট পেজে ফেরত পাঠানোর জন্য সাকসেস ইউআরএল
    success_url: `${config.FRONTEND_URL}/checkout/${bookingId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/checkout/${bookingId}?status=cancelled`,
    customer_email: userEmail,
    metadata: {
      bookingId, 
      userId,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment session created successfully',
    data: { id: session.id, url: session.url },
  });
});

const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const webhookSecret = config.STRIPE.STRIPE_WEBHOOK_SECRET; 
    
    // সিগনেচার ভেরিফাই (অবশ্যই raw body ব্যবহার করতে হবে app.ts এ)
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

    if (!bookingId || !userId) {
      console.error("⚠️ Error: Missing metadata in Stripe session");
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      console.log(`⏳ Processing fulfillment for Booking: ${bookingId}...`);

      // ১. ডাটাবেস আপডেট (Status -> PAID)
      const bookingData = await PaymentService.fulfillOrder({
        transactionId: (session.payment_intent as string) || (session.id as string),
        amount: session.amount_total / 100, 
        bookingId: bookingId,
        userId: userId,
      });

      if (bookingData) {
        // ২. ইনভয়েস জেনারেট
        const pdfBase64 = await InvoiceService.generateInvoicePDF({
          userName: bookingData.user.name,
          userEmail: bookingData.user.email,
          bookingId: bookingData.id,
          eventName: bookingData.event.title,
          amount: bookingData.totalAmount,
          transactionId: (session.payment_intent as string) || "N/A",
          date: new Date().toLocaleDateString(),
        });

        // ৩. ইমেইল পাঠানো
        await sendEmailWithInvoice(
          bookingData.user.email,
          pdfBase64,
          `Invoice_${bookingData.id}.pdf`,
          bookingData.user.name
        );

        console.log(`🚀 SUCCESS: Fulfillment completed for ${bookingData.user.email}`);
      }
    } catch (error: any) {
      console.error('❌ Fulfillment Error:', error.message);
    }
  }

  res.json({ received: true });
};

export const PaymentController = {
  createPaymentSession,
  handleStripeWebhook,
};