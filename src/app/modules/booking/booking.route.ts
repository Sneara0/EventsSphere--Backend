import express from 'express';
import { BookingController } from './booking.controller';


import { checkAuth } from 'src/app/middlewares/checkAuth';
import { Role } from 'src/generated/prisma/enums';

const router = express.Router();

/**
 * 1. User & Participant: নতুন বুকিং বা রেজিস্ট্রেশন করা
 */
router.post(
  '/create-booking',
  checkAuth(Role.USER, Role.PARTICIPANT),
  BookingController.createBooking
);

/**
 * 2. User & Participant: নিজের বুকিং হিস্ট্রি দেখা
 */
router.get(
  '/my-bookings',
  checkAuth(Role.USER, Role.PARTICIPANT),
  BookingController.getMyBookings
);

/**
 * 3. Organizer & Admin: ইভেন্টের সব বুকিং লিস্ট দেখা
 */
router.get(
  '/',
checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.ORGANIZER),
  BookingController.getAllBookings
);

/**
 * 4. Admin & Organizer: বুকিং স্ট্যাটাস আপডেট (Manual Approval)
 */
router.patch(
  '/:id',
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.ORGANIZER),
  BookingController.updateBookingStatus
);

/**
 * 5. Super Admin: বুকিং ডিলিট করা (Full Control)
 */
router.delete(
  '/:id',
  checkAuth(Role.SUPER_ADMIN),
  BookingController.deleteBooking
);

export const BookingRoutes = router;