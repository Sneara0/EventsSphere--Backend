import { Request, Response } from "express";
export declare const AuthController: {
    registerUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    loginUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMe: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getNewToken: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    changePassword: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    logoutUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    verifyEmail: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    forgetPassword: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    googleLogin: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    googleLoginSuccess: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    handleOAuthError: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
