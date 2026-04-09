// 📂 src/app/modules/payment/payment.controller.ts

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config/env'; 
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { sendEmailWithInvoice } from '../../utils/sendEmail';
import { stripe } from '../../../config/stripe.config';
import { catchAsync } from 'src/app/utils/catchAsync';
import { sendResponse } from 'src/app/utils/sendResponse';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, totalAmount, userEmail, userId, eventName } = req.body;
  console.log(`⏳ Creating payment session for Booking: ${bookingId}...`);

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
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.FRONTEND_URL}/payment/cancel`,
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

  console.log("🔔 Webhook Signal Received! Checking signature...");

  try {
    const webhookSecret = config.STRIPE.STRIPE_WEBHOOK_SECRET; 
    
    // সিগনেচার ভেরিফাই করা
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig,
      webhookSecret
    );
    console.log("✅ Webhook Verified: ", event.type);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    // যদি এখানে এরর আসে, তবে বুঝবেন whsec_... কোডটি ভুল
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { bookingId, userId } = session.metadata;

    console.log("📦 Metadata Received:", { bookingId, userId });

    if (!bookingId || !userId) {
      console.error("⚠️ Error: BookingId or UserId missing in Metadata!");
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      console.log(`⏳ Processing fulfillment for Booking: ${bookingId}...`);

      const bookingData = await PaymentService.fulfillOrder({
        transactionId: (session.payment_intent as string) || (session.id as string),
        amount: session.amount_total / 100, 
        bookingId: bookingId,
        userId: userId,
      });

      if (bookingData) {
        console.log("✅ Database Updated. Generating Invoice...");

        const pdfBase64 = await InvoiceService.generateInvoicePDF({
          userName: bookingData.user.name,
          userEmail: bookingData.user.email,
          bookingId: bookingData.id,
          eventName: bookingData.event.title,
          amount: bookingData.totalAmount,
          transactionId: (session.payment_intent as string) || "N/A",
          date: new Date().toLocaleDateString(),
        });

        console.log("📄 Invoice Generated. Sending Email to:", bookingData.user.email);

        await sendEmailWithInvoice(
          bookingData.user.email,
          pdfBase64,
          `Invoice_${bookingData.id}.pdf`,
          bookingData.user.name
        );

        console.log(`🚀 SUCCESS: Fulfillment completed for Booking: ${bookingId}`);
      }
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