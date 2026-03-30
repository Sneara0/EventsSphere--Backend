import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { EventRoutes } from "../modules/event/event.route"; 
import { OrganizerRoutes } from "../modules/organizer/organizer.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { CouponRoutes } from "../modules/coupon/coupon.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

const router = Router();


router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/events", EventRoutes); 
router.use("/organizer",OrganizerRoutes)
router.use("/bookings",BookingRoutes)
router.use("/coupon",CouponRoutes)
router.use("/dashboard",DashboardRoutes)
router.use("/payments",PaymentRoutes)

export const IndexRoutes = router;