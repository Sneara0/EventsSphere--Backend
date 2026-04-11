// 📂 src/app/modules/payment/payment.utils.ts
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
export const sendInvoiceEmail = async (userEmail, bookingDetails) => {
    // ১. PDF তৈরি করা
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice-${bookingDetails.id}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));
    // PDF কন্টেন্ট (ডিজাইন আপনার মতো করে নিতে পারেন)
    doc.fontSize(25).text("EVENT SPHERE INVOICE", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Event: ${bookingDetails.eventTitle}`);
    doc.text(`Quantity: ${bookingDetails.quantity}`);
    doc.text(`Total Paid: $${bookingDetails.totalAmount}`);
    doc.text(`Transaction ID: ${bookingDetails.transactionId}`);
    doc.end();
    // ২. Nodemailer ট্রান্সপোর্টার সেটআপ
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // ৩. ইমেইল পাঠানো
    await transporter.sendMail({
        from: '"Event Sphere" <no-reply@eventsphere.com>',
        to: userEmail,
        subject: "Your Booking is Confirmed! 🚀",
        text: "Please find your attached invoice for the flight event.",
        attachments: [
            {
                filename: "Ticket_Invoice.pdf",
                path: filePath,
            },
        ],
    });
    // পাঠানো শেষে টেম্পোরারি ফাইলটি ডিলিট করে দেওয়া ভালো
    // fs.unlinkSync(filePath);
};
