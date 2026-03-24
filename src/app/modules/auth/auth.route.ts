import { Router } from "express";
import { AuthController } from "./auth.controller";

import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "src/app/middlewares/checkAuth";

const router = Router();

// --- Public Routes ---
// রেজিস্ট্রেশন এবং লগইন
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);

// টোকেন রিফ্রেশ (নতুন এক্সেস টোকেন পাওয়ার জন্য)
router.post("/refresh-token", AuthController.getNewToken);

// ইমেইল ভেরিফিকেশন ও পাসওয়ার্ড রিকভারি
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

// Google OAuth রুটস
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);


// --- Protected Routes ---
// লগইন করা ইউজারদের জন্য (Admin, Organizer, Participant/Patient)
router.get(
    "/me", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.ORGANIZER, Role.PARTICIPANT), 
    AuthController.getMe
);

router.post(
    "/change-password",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.ORGANIZER, Role.PARTICIPANT),
    AuthController.changePassword
);

router.post(
    "/logout",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.ORGANIZER, Role.PARTICIPANT),
    AuthController.logoutUser
);

export const AuthRoutes = router;