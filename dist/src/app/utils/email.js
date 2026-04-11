/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import env from "../../config/env";
/**
 * 🛠️ SMTP Password থেকে স্পেস সরানো এবং কনফিগারেশন।
 */
const smtpPass = env.EMAIL_SENDER?.SMTP_PASS ? env.EMAIL_SENDER.SMTP_PASS.replace(/\s+/g, '') : '';
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env.EMAIL_SENDER?.SMTP_USER,
        pass: smtpPass
    },
    tls: {
        rejectUnauthorized: false
    }
});
export const sendEmail = async ({ subject, templateData, templateName, to, attachments }) => {
    try {
        /**
         * 🚨 পাথ ফিক্স:
         * আপনার ফাইলটি যেহেতু 'H:\eventsphere-backend\templates\otp.ejs' এ আছে,
         * তাই "src", "app" অংশটুকু বাদ দেওয়া হয়েছে।
         */
        const templatePath = path.join(process.cwd(), "templates", `${templateName}.ejs`);
        console.log("🔍 Attempting to load template from:", templatePath);
        // EJS রেন্ডার করা হচ্ছে
        const html = await ejs.renderFile(templatePath, templateData);
        const info = await transporter.sendMail({
            from: `"Event Sphere" <${env.EMAIL_SENDER?.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        });
        console.log(`✅ Email sent successfully to ${to}`);
        return info;
    }
    catch (error) {
        console.error("❌ Email Sending Error Details:", error);
        throw error;
    }
};
