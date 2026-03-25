import { Router } from "express";
import { EventController } from "./event.controller";


import { EventValidation } from "./event.validation";
import { Role } from "../../../generated/prisma/enums";

import { checkAuth } from "src/app/middlewares/checkAuth";
import { validateRequest } from "src/app/middlewares/validateRequest";

const router = Router();

router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getSingleEvent);

router.post(
    "/",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    upload.single("image"),
    validateRequest(EventValidation.createEvent),
    EventController.createEvent
);

router.patch(
    "/:id",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    upload.single("image"),
    validateRequest(EventValidation.updateEvent),
    EventController.updateEvent
);

router.delete(
    "/:id",
    checkAuth(Role.ORGANIZER, Role.ADMIN),
    EventController.deleteEvent
);

export const EventRoutes = router;