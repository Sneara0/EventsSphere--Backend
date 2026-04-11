export declare const ContactService: {
    sendEmailIntoEmailServer: (payload: {
        email: string;
        subject: string;
        message: string;
    }) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
};
