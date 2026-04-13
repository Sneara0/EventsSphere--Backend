import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth.js';
import { Role } from '../../../generated/prisma/enums.js';
import { PaymentController } from './payment.controller.js';

const router = express.Router();

/**
 * ১. Stripe Checkout Session তৈরি করা
 * এখানে সব রোলের ইউজাররাই পেমেন্ট সেশন তৈরি করতে পারবে
 */
router.post(
  '/create-session',
  checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN), 
  PaymentController.createPaymentSession
);

/**
 * ২. Stripe Webhook (এখানে ডিফাইন করার প্রয়োজন নেই)
 * কারণ আমরা এটি app.ts এ express.raw() দিয়ে সরাসরি হ্যান্ডেল করছি।
 * এখানে দিলে সেটি express.json() এর কারণে এরর দিতে পারে।
 */

export const PaymentRoutes = router;