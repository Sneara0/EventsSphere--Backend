import { ContactService } from './contact.service.js';
const sendPrivacyInquiry = async (req, res) => {
    try {
        const result = await ContactService.sendEmailIntoEmailServer(req.body);
        res.status(200).json({
            success: true,
            message: "Message sent successfully!",
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || "Failed to send message",
        });
    }
};
export const ContactController = {
    sendPrivacyInquiry,
};
