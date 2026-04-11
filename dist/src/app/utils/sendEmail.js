// 📂 src/app/utils/sendEmail.ts
import nodemailer from 'nodemailer';
import env from '../../config/env';
export const sendEmailWithInvoice = async (to, pdfBase64, fileName = 'Invoice.pdf', userName) => {
    const transporter = nodemailer.createTransport({
        host: env.EMAIL_SENDER.SMTP_HOST,
        port: Number(env.EMAIL_SENDER.SMTP_PORT),
        secure: true,
        auth: {
            user: env.EMAIL_SENDER.SMTP_USER,
            pass: env.EMAIL_SENDER.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false // লোকালহোস্টের সিকিউরিটি এরর এড়াতে
        }
    });
    try {
        const info = await transporter.sendMail({
            from: `"EventSphere" <${env.EMAIL_SENDER.SMTP_FROM}>`,
            to,
            subject: "Your Event Ticket & Invoice - EventSphere",
            html: `<h2>Hi ${userName || 'Valued Customer'},</h2>
             <p>Your payment is confirmed! Please find your invoice attached.</p>`,
            attachments: [{
                    filename: fileName,
                    content: pdfBase64,
                    encoding: 'base64',
                }],
        });
        console.log(`📧 Email sent successfully to: ${to}`);
        return info;
    }
    catch (error) {
        console.error("❌ Email Sending Error:", error);
        throw error;
    }
};
