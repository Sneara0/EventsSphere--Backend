import express, { Request, Response } from 'express';
import { Resend } from 'resend';

const router = express.Router();

// সরাসরি API Key ব্যবহার করা হয়েছে যাতে .env এর ঝামেলা না থাকে
const resend = new Resend('re_j9xu2Sfs_6MU1qTWMdsEmNZMqLmiqDBDJ');

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, subject, message } = req.body;

    // ১. ডাটা চেক
    if (!email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "সবগুলো ফিল্ড পূরণ করুন (email, subject, message)" 
      });
    }

    // ২. ইমেইল পাঠানো
    const { data, error } = await resend.emails.send({
      from: 'EventSphere <onboarding@resend.dev>',
      to: ['snearaparvin.cse1@gmail.com'], // আপনার ভেরিফাইড ইমেইল
      subject: `Privacy Support: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">New Privacy Message</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Topic:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });

  } catch (err: any) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export const ContactRoutes = router;