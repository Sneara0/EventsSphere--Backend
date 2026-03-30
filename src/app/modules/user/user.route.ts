import { Router } from "express";
import { UserController } from "./user.controller";


import { Role } from "../../../generated/prisma/enums";
import { checkAuth  } from "src/app/middlewares/checkAuth";

const router = Router();

/**
 * 1. Get My Profile
 * Access: Any Logged-in User (Participant, Organizer, Admin)
 */
router.get(
    "/me",
    checkAuth(Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN),
    UserController.getMyProfile
);

/**
 * 2. Update My Profile
 * Access: Any Logged-in User
 * Validation: Zod schema for partial updates
 */
router.patch(
    "/update-profile",
    checkAuth(Role.PARTICIPANT, Role.ORGANIZER, Role.ADMIN),
   (UserController.updateMyProfile),
 
);

/**
 * 3. Get All Users (Role-wise filtering via Query)
 * Access: Admin Only
 * Example: /api/v1/users?role=ORGANIZER
 */
router.get(
    "/",
    checkAuth(Role.ADMIN),
    UserController.getAllUsers
);

/**
 * 4. Get Single User by ID
 * Access: Admin, Organizer
 */
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.ORGANIZER),
    UserController.getSingleUser
);

export const UserRoutes = router;