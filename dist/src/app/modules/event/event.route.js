import { Router } from "express";
import { EventController } from "./event.controller.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { multerUpload } from "../../../config/multer.config.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { EventValidation } from "./event.validation.js";
const router = Router();
/**
 * ডাটা টাইপ কনভার্টার মিডলওয়্যার:
 * FormData থেকে আসা স্ট্রিংগুলোকে নাম্বার এবং বুলিয়ানে রূপান্তর করে
 */
const parseEventData = (req, res, next) => {
    if (req.body) {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        if (req.body.ticketPrice)
            req.body.ticketPrice = Number(req.body.ticketPrice);
        if (req.body.totalSeats)
            req.body.totalSeats = Number(req.body.totalSeats);
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
router.get("/ai-suggestions", EventController.getAISuggestions); // ✨ AI ফিচার রাউট
router.get("/:id", EventController.getSingleEvent);
/**
 * Protected Routes
 */
// ১. এডমিন ড্যাশবোর্ড স্ট্যাটস (শুধুমাত্র এডমিনদের জন্য)
router.get("/admin/stats", checkAuth(Role.ADMIN), // 📊 Stats রাউট
EventController.getEventStats);
// ২. নতুন ইভেন্ট/ফ্লাইট অফার তৈরি করা
router.post("/", checkAuth(Role.ORGANIZER, Role.ADMIN), // সাধারণ পার্টিসিপেন্ট সাধারণত ইভেন্ট তৈরি করতে পারে না
multerUpload.single("image"), parseEventData, validateRequest(EventValidation.createEventZodSchema), EventController.createEvent);
// ৩. বিদ্যমান ফ্লাইট আপডেট করা
router.patch("/:id", checkAuth(Role.ORGANIZER, Role.ADMIN), multerUpload.single("image"), parseEventData, validateRequest(EventValidation.updateEventZodSchema), EventController.updateEvent);
// ৪. ফ্লাইট ডিলিট করা
router.delete("/:id", checkAuth(Role.ORGANIZER, Role.ADMIN), EventController.deleteEvent);
export const EventRoutes = router;
