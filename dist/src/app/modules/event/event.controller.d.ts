import { Request, Response } from "express";
export declare const EventController: {
    createEvent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllEvents: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getSingleEvent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateEvent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteEvent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getEventStats: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAISuggestions: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
