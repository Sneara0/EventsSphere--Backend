// 📂 src/app/modules/booking/booking.routes.ts
import express from 'express';
import { BookingController } from './booking.controller';
import { checkAuth } from 'src/app/middlewares/checkAuth';
import { Role } from 'src/generated/prisma/enums';
const router = express.Router();
router.post('/create-booking', checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER), // এখানে ORGANIZER যোগ করা হলো
BookingController.createBooking);
router.get('/my-bookings', 
// এখানে Role.ORGANIZER যোগ করুন যাতে অর্গানাইজাররাও তাদের টিকিট দেখতে পারে
checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN), BookingController.getMyBookings);
// 🚀 এটিই আপনার চেকআউট পেজের ডাটা লোড করবে
router.get('/:id', checkAuth(Role.USER, Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN), BookingController.getSingleBooking);
router.get('/', checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.ORGANIZER), BookingController.getAllBookings);
router.patch('/:id', checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.ORGANIZER), BookingController.updateBookingStatus);
router.delete('/:id', checkAuth(Role.SUPER_ADMIN), BookingController.deleteBooking);
export const BookingRoutes = router;
