import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import env from "src/config/env";

/**
 * 🛠️ Safe Pass Retrieval:
 * যদি .env থেকে ডাটা না আসে, তবে এটি খালি স্ট্রিং ধরে নেবে যাতে সার্ভার ক্র্যাশ না করে।
 */
const smtpPass = env.EMAIL_SENDER?.SMTP_PASS ? env.EMAIL_SENDER.SMTP_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: env.EMAIL_SENDER?.SMTP_USER,
        pass: smtpPass
    },
    tls: {
        rejectUnauthorized: false 
    }
});

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

export const sendEmail = async ({ subject, templateData, templateName, to, attachments }: SendEmailOptions) => {
    try {
        const templatePath = path.join(process.cwd(), "src", "app", "templates", `${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: `"${env.EMAIL_SENDER?.SMTP_FROM}" <${env.EMAIL_SENDER?.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        });

        console.log(`✅ Email sent to ${to} : ${info.messageId}`);
    } catch (error: any) {
        console.error("❌ Email Sending Error:", error.message);
    }
};