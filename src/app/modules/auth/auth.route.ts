import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { AuthController } from "./auth.controller.js";
import { Role } from "../../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import auth from "../../lib/auth.js";


const router = Router();

// --- ১. কাস্টম এপিআই রাউটস ---
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewToken);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

// --- ২. প্রোটেক্টেড রাউটস ---
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
    // সাময়িকভাবে checkAuth ছাড়া ট্রাই করে দেখুন ৪০৪ যায় কি না
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.ORGANIZER, Role.PARTICIPANT),
    AuthController.logoutUser
);

// --- ৩. Better Auth ইন্টারনাল হ্যান্ডলার (FIXED for Node v24) ---
/**
 * সরাসরি 'all' এর বদলে ওয়াইল্ডকার্ড ছাড়া হ্যান্ডলার ব্যবহার করুন।
 * এটি /auth/ এর পরের সব সাব-পাথ (login, session, etc.) ধরবে।
 */
router.use((req, res, next) => {
    // Better-Auth এর হ্যান্ডলারকে সরাসরি কল করা হচ্ছে
    const handler = toNodeHandler(auth);
    return handler(req, res);
});

export const AuthRoutes = router;