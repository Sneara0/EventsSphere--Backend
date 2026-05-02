import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth.js';
import { Role } from '../../../generated/prisma/enums.js';
import { PaymentController } from './payment.controller.js';
const router = express.Router();
/**
 * ১. Stripe Checkout Session তৈরি করা
 * এখানে সব রোলের ইউজাররাই পেমেন্ট সেশন তৈরি করতে পারবে
 */
router.post('/create-session', checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN), PaymentController.createPaymentSession);
/**
 * ২. ইনভয়েস ডাউনলোড করা
 * এই রুটটি ইউজারকে তার বুকিং আইডি দিয়ে ইনভয়েস ডাউনলোড করতে দিবে
 */
router.get('/download-invoice/:bookingId', checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN), PaymentController.downloadInvoice);
/**
 * দ্রষ্টব্য: Stripe Webhook app.ts এ হ্যান্ডেল করা হচ্ছে।
 */
export const PaymentRoutes = router;
