
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";

import AppError from "../errorHelpers/AppError";
import env from "src/config/env";



const transporter = nodemailer.createTransport({
    host : env.SMTP_HOST,
    secure: true,
    auth: {
        user: env.EMAIL_SENDER.SMTP_USER,
        pass: env.EMAIL_SENDER.SMTP_PASS
    },
    port: Number(env.EMAIL_SENDER.SMTP_PORT)
})

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[]
}

export const sendEmail = async ({subject, templateData, templateName, to, attachments} : SendEmailOptions) => {
   
    
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: env.EMAIL_SENDER.SMTP_FROM,
            to : to,
            subject : subject,
            html : html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        })

        console.log(`Email sent to ${to} : ${info.messageId}`);
    } catch (error : any) {
        console.log("Email Sending Error", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
    }
}