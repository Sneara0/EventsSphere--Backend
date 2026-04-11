import status from "http-status";
import { UserStatus } from "../../generated/prisma/enums.js";
import { cookieUtils } from "../utils/cookie.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../errorHelpers/AppError.js";
import { jwtUtils } from "../utils/jwt.js";
import env from "../../config/env.js"; // পাথটি চেক করে নিন
export const checkAuth = (...authRoles) => async (req, res, next) => {
    try {
        // ২. কুকি থেকে এক্সেস টোকেন নেওয়া
        const accessToken = cookieUtils.getCookie(req, 'accessToken');
        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED, 'আপনি লগইন করা নেই! দয়া করে আবার লগইন করুন।');
        }
        // ৩. JWT ভেরিফাই করা
        const verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);
        if (!verifiedToken) {
            throw new AppError(status.UNAUTHORIZED, 'আপনার সেশন শেষ হয়ে গেছে। আবার লগইন করুন।');
        }
        // ৪. টোকেন থেকে userId বের করা (সহজ এবং ক্লিন লজিক)
        const userId = verifiedToken.userId || verifiedToken.id || (verifiedToken.data && verifiedToken.data.userId);
        if (!userId) {
            throw new AppError(status.UNAUTHORIZED, 'Invalid token payload!');
        }
        // ৫. ডাটাবেস থেকে লেটেস্ট ইউজার ডাটা চেক করা
        // টোকেনের রোলের ওপর ভরসা না করে সরাসরি DB থেকে রোল চেক করা বেশি নিরাপদ
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new AppError(status.UNAUTHORIZED, 'ইউজার খুঁজে পাওয়া যায়নি!');
        }
        // ৬. ইউজারের স্ট্যাটাস চেক করা
        if (user.status === UserStatus.BLOCKED || user.isDeleted) {
            throw new AppError(status.FORBIDDEN, 'আপনার অ্যাকাউন্টটি ব্লকড অথবা ডিলিট করা হয়েছে।');
        }
        // ৭. রোল (Role) পারমিশন চেক করা (সবচেয়ে গুরুত্বপূর্ণ অংশ)
        const userRole = user.role;
        if (authRoles.length > 0 && !authRoles.includes(userRole)) {
            // এই লগটি আপনাকে টার্মিনালে দেখাবে আসলে কী সমস্যা হচ্ছে
            console.log(`[Permission Denied] User: ${user.email}, Role: ${userRole}, Required: ${authRoles}`);
            throw new AppError(status.FORBIDDEN, `আপনার এই কাজটি করার অনুমতি নেই। আপনার রোল: ${userRole}, কিন্তু প্রয়োজন: ${authRoles.join(' বা ')}`);
        }
        // ৮. Request অবজেক্টে লেটেস্ট ইউজার ডাটা সেট করা
        req.user = {
            userId: user.id,
            role: userRole,
            email: user.email,
        };
        next();
    }
    catch (error) {
        // JWT এরর হ্যান্ডলিং
        if (error.name === 'TokenExpiredError') {
            return next(new AppError(status.UNAUTHORIZED, 'AccessTokenExpired'));
        }
        next(error);
    }
};
