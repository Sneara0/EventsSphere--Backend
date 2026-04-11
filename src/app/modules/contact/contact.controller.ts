import { Request, Response } from 'express';
import { ContactService } from './contact.service.js';

const sendPrivacyInquiry = async (req: Request, res: Response) => {
  try {
    const result = await ContactService.sendEmailIntoEmailServer(req.body);

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to send message",
    });
  }
};

export const ContactController = {
  sendPrivacyInquiry,
};