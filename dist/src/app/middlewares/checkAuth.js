import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums.js";
import { cookieUtils } from "../utils/cookie.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../errorHelpers/AppError.js";
import { jwtUtils } from "../utils/jwt.js";
import env from "../../config/env.js";
export const checkAuth = (...authRoles) => async (req, res, next) => {
    try {
        // --- হাইব্রিড টোকেন এক্সট্রাকশন (HEADERS + COOKIES) ---
        // ১. প্রথমে Authorization Header চেক করবে, না থাকলে Cookies চেক করবে
        const authHeader = req.headers.authorization;
        let accessToken = "";
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.split(' ')[1];
        }
        else {
            accessToken = cookieUtils.getCookie(req, 'accessToken');
        }
        // টোকেন না থাকলে এরর
        if (!accessToken) {
            return next(new AppError(status.UNAUTHORIZED, 'You are not logged in! Please login to gain access.'));
        }
        // ২. JWT ভেরিফাই করা
        let verifiedToken;
        try {
            verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);
        }
        catch (err) {
            // যদি টোকেন এক্সপায়ারড হয় তবে নির্দিষ্ট মেসেজ পাঠানো যাতে ফ্রন্টএন্ড রিফ্রেশ টোকেন কল করতে পারে
            if (err.name === 'TokenExpiredError') {
                return next(new AppError(status.UNAUTHORIZED, 'AccessTokenExpired'));
            }
            return next(new AppError(status.UNAUTHORIZED, 'Your session is invalid. Please login again.'));
        }
        // ৩. userId বের করা (Flexible structure)
        const userId = verifiedToken.userId || verifiedToken.id;
        if (!userId) {
            return next(new AppError(status.UNAUTHORIZED, 'Invalid token payload!'));
        }
        // ৪. ডাটাবেস থেকে ইউজারের আপডেট তথ্য নেওয়া
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return next(new AppError(status.UNAUTHORIZED, 'User not found!'));
        }
        // ৫. অ্যাকাউন্ট স্ট্যাটাস চেক
        if (user.status === UserStatus.BLOCKED || user.isDeleted) {
            return next(new AppError(status.FORBIDDEN, 'Your account has been blocked or deleted.'));
        }
        // ৬. রোল পারমিশন চেক
        const userRole = user.role;
        // SUPER_ADMIN হলে সব এক্সেস পাবে
        if (userRole === Role.SUPER_ADMIN) {
            // Granted
        }
        else if (authRoles.length > 0 && !authRoles.includes(userRole)) {
            return next(new AppError(status.FORBIDDEN, `Access denied. Required: ${authRoles.join(' or ')}`));
        }
        // ৭. Request অবজেক্টে ডাটা অ্যাটাচ করা
        req.user = {
            userId: user.id,
            role: userRole,
            email: user.email,
        };
        return next();
    }
    catch (error) {
        return next(error);
    }
};
