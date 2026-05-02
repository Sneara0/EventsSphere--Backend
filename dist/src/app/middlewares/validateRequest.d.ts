import { NextFunction, Request, Response } from "express";
/**
 * ZodSchema এর টাইপ 'any' রাখা হয়েছে যাতে আপনার ভার্সন জনিত
 * 'AnyZodObject' বা 'ZodObject' এর টাইপ এররটি আর না আসে।
 */
export declare const validateRequest: (ZodSchema: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
