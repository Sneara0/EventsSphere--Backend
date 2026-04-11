import { Router } from "express";
import { OrganizerController } from "./organizer.controller.js";
import { OrganizerValidation } from "./organizer.validation.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { Role } from "../../../generated/prisma/enums.js";
const router = Router();
/**
 * 1. Create Organizer Profile
 * Access: Only logged-in users with ORGANIZER role
 */
router.post("/create-profile", checkAuth(Role.ORGANIZER), validateRequest(OrganizerValidation.createOrganizer), OrganizerController.createProfile);
/**
 * 2. Get My Profile
 * Access: Organizer or Admin
 */
router.get("/me", checkAuth(Role.ORGANIZER, Role.ADMIN), OrganizerController.getMyProfile);
/**
 * 3. Update Organizer Profile
 * Access: Only the Organizer themselves
 * Method: PATCH (Partial update)
 */
router.patch("/update-profile", checkAuth(Role.ORGANIZER), validateRequest(OrganizerValidation.updateOrganizer), OrganizerController.updateMyProfile);
export const OrganizerRoutes = router;
