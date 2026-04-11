import nodemailer from 'nodemailer';
import config from 'src/config/env';
import env from 'src/config/env';
 // আপনার কনফিগ ফাইলের সঠিক পাথ দিন

const sendEmailIntoEmailServer = async (payload: { email: string; subject: string; message: string }) => {
  const { email, subject, message } = payload;

  // কনফিগ থেকে ডাটা নিয়ে ট্রান্সপোর্টার তৈরি
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SENDER.SMTP_HOST,
    port: Number(env.EMAIL_SENDER.SMTP_PORT),
    secure: env.EMAIL_SENDER.SMTP_PORT === '465', // ৪৬৫ হলে ট্রু
    auth: {
      user: env.EMAIL_SENDER.SMTP_USER,
      pass: env.EMAIL_SENDER.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"EventSphere Support" <${env.EMAIL_SENDER.SMTP_FROM}>`,
    to: env.EMAIL_SENDER.SMTP_FROM, // আপনি যেখানে মেসেজ রিসিভ করতে চান
    replyTo: email, 
    subject: `Privacy Inquiry: ${subject}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">New Message from EventSphere</h2>
        <p><strong>User Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export const ContactService = {
  sendEmailIntoEmailServer,
};