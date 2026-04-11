interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[];
}
export declare const sendEmail: ({ subject, templateData, templateName, to, attachments }: SendEmailOptions) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export {};
