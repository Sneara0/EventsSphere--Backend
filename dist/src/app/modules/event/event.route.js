import { Router } from "express";
import { EventController } from "./event.controller.js";
import { checkAuth } from "../../middlewares/checkAuth.js"; // পাথ আপনার প্রজেক্ট অনুযায়ী চেক করুন
import { Role } from "../../../generated/prisma/enums.js"; // পাথ চেক করুন
import { multerUpload } from "../../../config/multer.config.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { EventValidation } from "./event.validation.js";
const router = Router();
/**
 * ডাটা টাইপ কনভার্টার মিডলওয়্যার:
 * FormData থেকে আসা স্ট্রিংগুলোকে নাম্বার এবং বুলিয়ানে রূপান্তর করে
 * যাতে Zod ভ্যালিডেশন ফেইল না করে।
 */
const parseEventData = (req, res, next) => {
    if (req.body) {
        // যদি ফ্রন্টএন্ড থেকে 'data' কি-তে JSON স্ট্রিং পাঠানো হয়
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        // নাম্বার ফিল্ড কনভার্সন
        if (req.body.ticketPrice)
            req.body.ticketPrice = Number(req.body.ticketPrice);
        if (req.body.totalSeats)
            req.body.totalSeats = Number(req.body.totalSeats);
        // বুলিয়ান ফিল্ড কনভার্সন
        if (req.body.isRefundable) {
            req.body.isRefundable = req.body.isRefundable === "true" || req.body.isRefundable === true;
        }
    }
    next();
};
/**
 * Public Routes
 */
router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getSingleEvent);
/**
 * Protected Routes
 */
// ১. নতুন ফ্লাইট অফার তৈরি করা
router.post("/", checkAuth(Role.ORGANIZER, Role.ADMIN, Role.PARTICIPANT), multerUpload.single("image"), // প্রথমে ফাইল পার্স করা
parseEventData, // তারপর টাইপ ফিক্স করা
validateRequest(EventValidation.createEventZodSchema), // এবার Zod ভ্যালিডেশন কাজ করবে
EventController.createEvent);
// ২. বিদ্যমান ফ্লাইট আপডেট করা
router.patch("/:id", checkAuth(Role.ORGANIZER, Role.ADMIN), multerUpload.single("image"), parseEventData, validateRequest(EventValidation.updateEventZodSchema), EventController.updateEvent);
// ৩. ফ্লাইট ডিলিট করা
router.delete("/:id", checkAuth(Role.ORGANIZER, Role.ADMIN), EventController.deleteEvent);
export const EventRoutes = router;
