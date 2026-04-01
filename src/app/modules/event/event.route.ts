import { Router } from "express";
import { EventController } from "./event.controller";
import { checkAuth } from "src/app/middlewares/checkAuth";
import { Role } from "src/generated/prisma/enums";
import { multerUpload } from "src/config/multer.config";
import { validateRequest } from "src/app/middlewares/validateRequest";
import { EventValidation } from "./event.validation";

const router = Router();

/**
 * Public Routes
 * যে কেউ ফ্লাইট অফার এবং ডিটেইলস দেখতে পারবে
 */
router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getSingleEvent);

/**
 * Protected Routes
 * শুধুমাত্র Organizer (এজেন্সি) এবং Admin এই ফ্লাইটগুলো ম্যানেজ করতে পারবে
 */

// ১. নতুন ফ্লাইট অফার তৈরি করা
router.post(
    "/",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    // ফ্রন্টএন্ডে আমরা "image" কি-তে ফাইল পাঠাচ্ছি, তাই এটি নিশ্চিত করুন
    multerUpload.single("image"), 
    // Multer এর পর ভ্যালিডেশন চালানো উচিত কারণ এটি বডি ডাটা পার্স করে
    validateRequest(EventValidation.createEventZodSchema),
    EventController.createEvent
);

// ২. বিদ্যমান ফ্লাইট আপডেট করা
router.patch(
    "/:id",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    multerUpload.single("image"),
    validateRequest(EventValidation.updateEventZodSchema),
    EventController.updateEvent
);

// ৩. ফ্লাইট ডিলিট (Soft Delete) করা
router.delete(
    "/:id",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    EventController.deleteEvent
);

export const EventRoutes = router;