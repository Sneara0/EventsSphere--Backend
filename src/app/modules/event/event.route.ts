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
 * Everyone can view events and event details
 */
router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getSingleEvent);

/**
 * Protected Routes
 * Only Organizers and Admins can manage events
 */

// Create a new event
router.post(
    "/",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    multerUpload.single("image"), 
    validateRequest(EventValidation.createEventZodSchema),
    EventController.createEvent
);

// Update an existing event
router.patch(
    "/:id",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    multerUpload.single("image"),
    validateRequest(EventValidation.updateEventZodSchema),
    EventController.updateEvent
);

// Soft delete an event
router.delete(
    "/:id",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    EventController.deleteEvent
);

export const EventRoutes = router;