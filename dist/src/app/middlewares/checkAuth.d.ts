import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums.js";
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
export declare const checkAuth: (...authRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
