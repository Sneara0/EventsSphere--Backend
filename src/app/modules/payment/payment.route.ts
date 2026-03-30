import express from 'express';
import { PaymentController } from './payment.controller';
import { checkAuth } from 'src/app/middlewares/checkAuth';
import { Role } from 'src/generated/prisma/enums';


const router = express.Router();


router.post(
  '/create-session',
  checkAuth(Role.USER,'ORGANIZER','PARTICIPANT','ADMIN','SUPER_ADMIN'), 
  PaymentController.createPaymentSession
);

/**
 * ২. Stripe Webhook
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), 
  PaymentController.handleStripeWebhook
);

export const PaymentRoutes = router;