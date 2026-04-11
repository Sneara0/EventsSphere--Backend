import express from 'express';
import { ReviewController } from './review.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import { checkAuth } from 'src/app/middlewares/checkAuth';
const router = express.Router();
/**
 * ১. নতুন রিভিউ তৈরি করা (শুধুমাত্র লগইন করা ইউজার)
 */
router.post('/', checkAuth('USER', 'ADMIN', 'ORGANIZER'), // আপনার প্রোজেক্টের রোল অনুযায়ী
validateRequest(ReviewValidation.createReviewZodSchema), ReviewController.createReview);
/**
 * ২. একটি নির্দিষ্ট ইভেন্টের সব রিভিউ দেখা (পাবলিক রাউট)
 */
router.get('/event/:eventId', ReviewController.getEventReviews);
/**
 * ৩. নিজের রিভিউ আপডেট করা
 */
router.patch('/:id', checkAuth('USER', 'ADMIN', 'ORGANIZER', 'SUPER_ADMIN', 'PARTICIPANT'), validateRequest(ReviewValidation.updateReviewZodSchema), ReviewController.updateReview);
/**
 * ৪. রিভিউ ডিলিট করা
 */
router.delete('/:id', checkAuth('USER', 'ADMIN', 'SUPER_ADMIN'), ReviewController.deleteReview);
export const ReviewRoutes = router;
