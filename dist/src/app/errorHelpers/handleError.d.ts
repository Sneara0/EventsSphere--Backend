import z from "zod/v3";
import { TErrorResponse } from "../interfaces/error.interfaces.js";
export declare const handleZodError: (err: z.ZodError) => TErrorResponse;
