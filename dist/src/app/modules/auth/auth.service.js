import status from "http-status";
import { UserStatus, Role } from "../../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import { auth } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { jwtUtils } from "../../utils/jwt.js";
import { tokenUtils } from "../../utils/token.js";
import env from "../../../config/env.js";
/**
 * 1. Register User (Fully Fixed)
 */
const registerUser = async (payload) => {
    const { name, email, password, role } = payload;
    // Better-Auth API call
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: role?.toUpperCase() || Role.PARTICIPANT
        }
    });
    if (!data || !data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register user");
    }
    const user = data.user;
    // 🔥 এপিআই দিয়ে রেজিস্ট্রেশন করার পর স্ট্যাটাস ACTIVE নিশ্চিত করা
    // এটি না করলে আপনার মিডলওয়্যার ইউজারকে ব্লক করে দিবে
    await prisma.user.update({
        where: { id: user.id },
        data: {
            status: UserStatus.ACTIVE,
            isDeleted: false
        }
    });
    const tokenPayload = {
        userId: user.id,
        role: user.role || Role.PARTICIPANT,
        name: user.name,
        email: user.email,
        status: UserStatus.ACTIVE,
        isDeleted: false,
        emailVerified: user.emailVerified,
    };
    return {
        ...data,
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
    };
};
/**
 * 2. Login User (Fully Fixed)
 */
const loginUser = async (payload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: { email, password }
    });
    if (!data || !data.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }
    const user = data.user;
    // ১. স্ট্যাটাস এবং রোল চেকিং (Fallbacks included)
    const currentUserStatus = user.status || UserStatus.ACTIVE;
    const currentUserRole = user.role || Role.PARTICIPANT;
    if (currentUserStatus === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is blocked");
    }
    if (user.isDeleted || currentUserStatus === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    // ২. টোকেন পেলোড (সুপার অ্যাডমিনের মতো সব ফিল্ড এখানে নিশ্চিত করা হয়েছে)
    const tokenPayload = {
        userId: user.id,
        role: currentUserRole,
        name: user.name,
        email: user.email,
        status: currentUserStatus,
        isDeleted: user.isDeleted || false,
        emailVerified: user.emailVerified || false,
    };
    return {
        ...data,
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
    };
};
/**
 * 3. Get Current User (Me)
 */
const getMe = async (user) => {
    const result = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
            participant: true,
            organizer: true,
            admin: true,
        }
    });
    if (!result)
        throw new AppError(status.NOT_FOUND, "User not found");
    return result;
};
/**
 * 4. Refresh Token Logic
 */
const getNewToken = async (refreshToken, sessionToken) => {
    const isSessionExists = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true }
    });
    if (!isSessionExists)
        throw new AppError(status.UNAUTHORIZED, "Invalid session");
    const verified = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
    if (!verified)
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    const user = isSessionExists.user;
    const tokenPayload = {
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        isDeleted: user.isDeleted || false,
        emailVerified: user.emailVerified,
    };
    const updatedSession = await prisma.session.update({
        where: { token: sessionToken },
        data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });
    return {
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
        sessionToken: updatedSession.token
    };
};
/**
 * 5. Google Login Success Logic
 */
const googleLoginSuccess = async (session) => {
    if (!session || !session.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid Google Session");
    }
    const user = session.user;
    const tokenPayload = {
        userId: user.id,
        role: user.role || Role.PARTICIPANT,
        name: user.name,
        email: user.email,
        status: user.status || UserStatus.ACTIVE,
        isDeleted: user.isDeleted || false,
        emailVerified: user.emailVerified,
    };
    return {
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
    };
};
// --- নিচের ফাংশনগুলো আগের মতোই থাকবে ---
const changePassword = async (payload, sessionToken) => {
    return await auth.api.changePassword({
        body: {
            currentPassword: payload.currentPassword,
            newPassword: payload.newPassword,
            revokeOtherSessions: true,
        },
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });
};
const logoutUser = async (sessionToken) => {
    return await auth.api.signOut({
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });
};
const forgetPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new AppError(status.NOT_FOUND, "User not found!");
    if (user.isDeleted)
        throw new AppError(status.FORBIDDEN, "Account deleted!");
    return await auth.api.requestPasswordResetEmailOTP({ body: { email } });
};
const resetPassword = async (email, otp, newPassword) => {
    const result = await auth.api.resetPasswordEmailOTP({
        body: { email, otp, password: newPassword }
    });
    const userResult = result;
    if (userResult?.user?.id) {
        await prisma.session.deleteMany({ where: { userId: userResult.user.id } });
    }
    return result;
};
const verifyEmail = async (email, otp) => {
    const result = await auth.api.verifyEmailOTP({ body: { email, otp } });
    if (result) {
        await prisma.user.update({
            where: { email },
            data: { emailVerified: true }
        });
    }
    return result;
};
export const AuthService = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSuccess,
};
