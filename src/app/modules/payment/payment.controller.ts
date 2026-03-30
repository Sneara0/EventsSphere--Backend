import { Request, Response } from 'express';
import httpStatus from 'http-status';
import env from '../../../config/env'; 
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { sendEmailWithInvoice } from '../../utils/sendEmail';
import { stripe } from '../../../config/stripe.config';
import { catchAsync } from 'src/app/utils/catchAsync';
import { sendResponse } from 'src/app/utils/sendResponse';

/**
 * ১. Stripe Checkout Session তৈরি করার কন্ট্রোলার
 */
const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, totalAmount, userEmail, userId } = req.body;

  console.log(`⏳ Creating payment session for Booking: ${bookingId}...`);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: 'Event Ticket Booking',
            description: `Booking ID: ${bookingId}`,
          },
          unit_amount: Math.round(totalAmount * 100), 
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
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

/**
 * ২. Stripe Webhook হ্যান্ডেলার
 */
const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    const webhookSecret = env.STRIPE?.STRIPE_WEBHOOK_SECRET as string;

    event = stripe.webhooks.constructEvent(
      req.body, 
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🔔 লগ: কোন ইভেন্টটি স্ট্রাইপ থেকে আসলো তা দেখতে
  console.log("🔔 Received Webhook Event Type:", event.type);

  // পেমেন্ট সফল হলে এই ব্লকটি কাজ করবে
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // 📦 লগ: মেটাডাটা ঠিকঠাক আসছে কি না চেক করা
    console.log("📦 Received Session Metadata:", session.metadata);

    const { bookingId, userId } = session.metadata;

    if (!bookingId || !userId) {
      console.error("⚠️ Error: BookingId or UserId missing in Metadata!");
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      console.log(`⏳ Processing fulfillment for Booking: ${bookingId}...`);

      // ক. ডাটাবেস আপডেট (Payment, Booking এবং Seat সংখ্যা কমানো)
      const bookingData = await PaymentService.fulfillOrder({
        transactionId: session.payment_intent as string,
        amount: session.amount_total / 100, 
        bookingId: bookingId,
        userId: userId,
      });

      console.log("✅ Database Updated Successfully. Generating Invoice...");

      // খ. ইনভয়েস জেনারেট করা (Base64 PDF)
      const pdfBase64 = await InvoiceService.generateInvoicePDF({
        userName: bookingData.user.name,
        userEmail: bookingData.user.email,
        bookingId: bookingData.id,
        eventName: bookingData.event.title,
        amount: bookingData.totalAmount,
        transactionId: session.payment_intent,
        date: new Date().toLocaleDateString(),
      });

      console.log("📄 Invoice Generated. Sending Email...");

      // গ. ইমেইল পাঠানো
      await sendEmailWithInvoice(
        bookingData.user.email,
        pdfBase64,
        `Invoice_${bookingData.id}.pdf`,
        bookingData.user.name
      );

      console.log(`🚀 SUCCESS: Payment, Database Update, and Email Sent for Booking: ${bookingId}`);

    } catch (error: any) {
      console.error('❌ Fulfillment Error Details:', error.message);
    }
  }

  res.json({ received: true });
};

export const PaymentController = {
  createPaymentSession,
  handleStripeWebhook,
};