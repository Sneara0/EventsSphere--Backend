import nodemailer from 'nodemailer';
import env from "src/config/env";

export const sendEmailWithInvoice = async (
  to: string, 
  pdfBase64: string, // এটি Base64 স্ট্রিং হবে
  fileName: string = 'Invoice.pdf', // ডিফল্ট নাম
  userName?: string 
) => {
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SENDER.SMTP_HOST, 
    port: Number(env.EMAIL_SENDER.SMTP_PORT),
    secure: false, 
    auth: {
      user: env.EMAIL_SENDER.SMTP_USER,
      pass: env.EMAIL_SENDER.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"EventSphere" <${env.EMAIL_SENDER.SMTP_FROM}>`,
    to,
    subject: "Your Event Ticket & Invoice",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4A90E2;">Hi ${userName || 'Customer'},</h2>
        <p>Your payment was successful! We are excited to have you at our event.</p>
        <p>Please find your official <b>Invoice & Ticket</b> attached to this email.</p>
        <div style="margin-top: 20px; padding: 10px; border-left: 4px solid #4A90E2; background: #f9f9f9;">
           <p>Thank you for choosing <b>EventSphere</b>.</p>
        </div>
        <br />
        <p>Best Regards,</p>
        <p><b>EventSphere Team</b></p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBase64,
        encoding: 'base64',
      },
    ],
  });
};