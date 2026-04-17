/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums.js"; 
import { cookieUtils } from "../utils/cookie.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../errorHelpers/AppError.js";
import { jwtUtils } from "../utils/jwt.js";
import env from "../../config/env.js"; 

// 1. Extend Request Interface for Type Safety
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
        email: string;
      };
    }
  }
}

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 2. Extract Access Token from Cookies
    const accessToken = cookieUtils.getCookie(req, 'accessToken');
    
    if (!accessToken) {
      return next(new AppError(status.UNAUTHORIZED, 'You are not logged in! Please login to gain access.'));
    }

    // 3. Verify JWT Token
    let verifiedToken: any;
    try {
        verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET as string);
    } catch (err) {
        return next(new AppError(status.UNAUTHORIZED, 'Your session has expired. Please login again.'));
    }

    if (!verifiedToken) {
      return next(new AppError(status.UNAUTHORIZED, 'Your session has expired. Please login again.'));
    }

    // 4. Extract userId from Token Payload
    const userId = verifiedToken.userId || verifiedToken.id || (verifiedToken.data && verifiedToken.data.userId);

    if (!userId) {
      return next(new AppError(status.UNAUTHORIZED, 'Invalid token payload!'));
    }

    // 5. Fetch latest User Data from Database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError(status.UNAUTHORIZED, 'User not found!'));
    }

    // 6. Check User Status
    if (user.status === UserStatus.BLOCKED || user.isDeleted) {
      return next(new AppError(status.FORBIDDEN, 'Your account has been blocked or deleted.'));
    }

    // 7. Role-based Permission Check
    const userRole = user.role as Role;

    // Super Admin Bypass Logic
    if (userRole === Role.SUPER_ADMIN) {
        // Access granted automatically
    } 
    else if (authRoles.length > 0 && !authRoles.includes(userRole)) {
      console.log(`[Permission Denied] User: ${user.email}, Role: ${userRole}, Required: ${authRoles}`);
      
      return next(new AppError(
        status.FORBIDDEN, 
        `Access denied. Your role is ${userRole}, but this action requires: ${authRoles.join(' or ')}`
      ));
    }

    // 8. Attach latest User Data to the Request Object
    req.user = {
      userId: user.id,
      role: userRole,
      email: user.email,
    };

    return next(); // অবশ্যই return next() ব্যবহার করবেন
  } catch (error: any) {
    // Specific JWT Error Handling
    if (error.name === 'TokenExpiredError') {
        return next(new AppError(status.UNAUTHORIZED, 'AccessTokenExpired'));
    }
    return next(error);
  }
};