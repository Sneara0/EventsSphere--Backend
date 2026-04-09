// 📂 src/app/utils/sendEmail.ts

import nodemailer from 'nodemailer';
import env from '../../config/env';

/**
 * ইউজারকে পেমেন্ট সাকসেস হওয়ার পর ইনভয়েসসহ ইমেইল পাঠানোর ফাংশন
 */
export const sendEmailWithInvoice = async (
  to: string, 
  pdfBase64: string, 
  fileName: string = 'Invoice.pdf', 
  userName?: string 
) => {
  // ১. ট্রান্সপোর্টার কনফিগারেশন
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SENDER.SMTP_HOST, 
    port: Number(env.EMAIL_SENDER.SMTP_PORT),
    secure: false, // ৫87 পোর্টের জন্য সাধারণত false হয়, ৪৬৫ হলে true
    auth: {
      user: env.EMAIL_SENDER.SMTP_USER,
      pass: env.EMAIL_SENDER.SMTP_PASS,
    },
  });

  // ২. ইমেইল পাঠানো
  try {
    const info = await transporter.sendMail({
      from: `"EventSphere" <${env.EMAIL_SENDER.SMTP_FROM}>`,
      to,
      subject: "Your Event Ticket & Invoice - EventSphere",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">Hi ${userName || 'Valued Customer'},</h2>
          <p>Great news! Your payment has been <b>confirmed successfully</b>. We are excited to see you at the event!</p>
          <p>Please find your official <b>Invoice & Ticket</b> attached to this email for your reference.</p>
          
          <div style="margin-top: 30px; padding: 20px; border-left: 5px solid #6366f1; background: #f8f9ff; border-radius: 5px;">
             <p style="margin: 0; font-weight: bold; color: #444;">Thank you for choosing EventSphere.</p>
             <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">If you have any questions, feel free to reply to this email.</p>
          </div>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
            <p>Best Regards,</p>
            <p style="font-weight: bold; color: #333;">EventSphere Team</p>
            <p>© 2026 EventSphere Inc. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: 'base64', // যেহেতু ইনভয়েসটি Base64 ফরম্যাটে আসছে
        },
      ],
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
    throw new Error("Failed to send invoice email.");
  }
};