import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth.js';
import { Role } from '../../../generated/prisma/enums.js';
import { PaymentController } from './payment.controller.js';


const router = express.Router();


router.post(
  '/create-session',
  // এখানে Role.ORGANIZER যোগ করুন
  checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN), 
  PaymentController.createPaymentSession
);


/**
 * ২. Stripe Webhook
 */


export const PaymentRoutes = router;