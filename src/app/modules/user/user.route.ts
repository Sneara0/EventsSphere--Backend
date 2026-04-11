import { Router } from "express";
import { UserController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth";


const router = Router();

/**
 * ১. Get My Profile
 * Access: Any Logged-in User (Participant, Organizer, Admin)
 */
router.get(
    "/me",
    checkAuth(Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN),
    UserController.getMyProfile
);

/**
 * ২. Update My Profile
 * Access: Any Logged-in User
 */
router.patch(
    "/update-profile",
    checkAuth(Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN),
    UserController.updateMyProfile
);

/**
 * ৩. Get All Users (Role-wise filtering via Query)
 * Access: Admin Only
 */
router.get(
    "/",
    checkAuth(Role.ADMIN),
    UserController.getAllUsers
);

/**
 * ৪. Get Single User by ID
 * Access: Admin, Organizer
 */
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.ORGANIZER),
    UserController.getSingleUser
);

/**
 * ৫. Delete User (Soft Delete)
 * Access: Admin Only
 * এটি আপনার SQL Error (Extra parameter 1000) সমাধান করবে।
 */
router.delete(
    "/:id",
    checkAuth(Role.ADMIN),
    UserController.deleteUser
);

export const UserRoutes = router;