import { Request, Response } from "express";
export declare const OrganizerController: {
    createProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllOrganizers: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getSingleOrganizer: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
