import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import env from "../../config/env"; // পাথটি আপনার প্রোজেক্ট অনুযায়ী চেক করে নিন

/**
 * 🛠️ পাসওয়ার্ড থেকে সব স্পেস সরিয়ে ফেলা হচ্ছে যাতে ভুল না হয়।
 */
const smtpPass = env.EMAIL_SENDER?.SMTP_PASS ? env.EMAIL_SENDER.SMTP_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
    // 'service' এর বদলে সরাসরি host এবং port ব্যবহার করা বেশি স্ট্যাবল
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // ৪৬৫ পোর্টের জন্য অবশ্যই true হবে
    auth: {
        user: env.EMAIL_SENDER?.SMTP_USER,
        pass: smtpPass // ncalvdgxvqhxqgel
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
        // টেমপ্লেট পাথটি নিশ্চিত করুন (src/app/templates/otp.ejs)
        const templatePath = path.join(process.cwd(), "src", "app", "templates", `${templateName}.ejs`);
        
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
    } catch (error: any) {
        // এররটি বিস্তারিতভাবে প্রিন্ট করা হচ্ছে যাতে সমস্যা বোঝা যায়
        console.error("❌ Email Sending Error Details:", error);
        throw error; 
    }
};