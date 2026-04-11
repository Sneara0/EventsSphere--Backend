import { Request, Response } from "express";
export declare const UserController: {
    getAllUsers: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getSingleUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteUser: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
