import { NextFunction, Request, Response } from "express";
import z from "zod";
export declare const validateRequest: (ZodSchema: z.ZodObject) => (req: Request, res: Response, next: NextFunction) => void;
