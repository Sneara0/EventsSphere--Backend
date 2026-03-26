import { Router } from 'express';


import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import { checkAuth } from 'src/app/middlewares/checkAuth';
import { validateRequest } from 'src/app/middlewares/validateRequest';

const router = Router();

/**
 * ১. নতুন বুকিং তৈরি করা (Create)
 * PARTICIPANT, ADMIN, ORGANIZER সবাই বুকিং করতে পারবে।
 */
router.post(
  '/create-booking',
  checkAuth('PARTICIPANT', 'ADMIN', 'ORGANIZER'), 
  validateRequest(BookingValidation.createBooking),
  BookingController.createBooking
);

/**
 * ২. ইউজারের নিজের সব বুকিং লিস্ট দেখা (Read All)
 */
router.get(
  '/my-bookings',
  checkAuth('PARTICIPANT', 'ADMIN', 'ORGANIZER'),
  BookingController.getMyBookings
);

/**
 * ৩. নির্দিষ্ট একটি বুকিং-এর বিস্তারিত দেখা (Read Single)
 */
router.get(
  '/:id',
  checkAuth('PARTICIPANT', 'ADMIN', 'ORGANIZER'),
  BookingController.getSingleBooking
);

/**
 * ৪. বুকিং ডিলিট বা ক্যানসেল করা (Delete & Restore Seat)
 * সাধারণত PARTICIPANT নিজে অথবা ADMIN এটি ডিলিট করতে পারে।
 */
router.delete(
  '/:id',
  checkAuth('PARTICIPANT', 'ADMIN'),
  BookingController.deleteBooking
);

export const BookingRoutes = router;