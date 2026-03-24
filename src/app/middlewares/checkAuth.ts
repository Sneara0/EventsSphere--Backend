/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums"; 
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";
import { jwtUtils } from "../utils/jwt";
import env from "src/config/env";



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

    const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

    if (!sessionToken) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No session token provided.');
    }


    const sessionExists = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: { gt: new Date() } 
      },
      include: { user: true }
    });

    if (!sessionExists || !sessionExists.user) {
      throw new AppError(status.UNAUTHORIZED, 'Session expired or invalid.');
    }

    const user = sessionExists.user;

   
    const now = new Date();
    const expiresAt = new Date(sessionExists.expiresAt);
    const createdAt = new Date(sessionExists.createdAt);

    const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

    if (percentRemaining < 20) {
      res.setHeader('X-Session-Refresh', 'true');
      console.log("Session Expiring Soon!!");
    }

    
    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
      throw new AppError(status.UNAUTHORIZED, 'Access denied! Your account is blocked or deleted.');
    }

   
    if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
      throw new AppError(status.FORBIDDEN, 'Forbidden access! Insufficient permissions.');
    }



    req.user = {
      userId: user.id,
      role: user.role as Role,
      email: user.email,
    };



   
    const accessToken = cookieUtils.getCookie(req, 'accessToken');
    if (!accessToken) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
    }

    const verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);
    if (!verifiedToken || !verifiedToken.success) {
      throw new AppError(status.UNAUTHORIZED, 'Invalid access token.');
    }


    next();
  } catch (error: any) {
    next(error);
  }
};