import { Request, Response } from 'express';
export declare const PaymentController: {
    createPaymentSession: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    handleStripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    downloadInvoice: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
