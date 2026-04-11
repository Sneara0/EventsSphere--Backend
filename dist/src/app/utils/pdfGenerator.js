import PDFDocument from 'pdfkit';
import fs from 'fs';
/**
 * @param bookingData - বুকিং এর ডিটেইলস (User Name, Event Name, Date, Price)
 * @param filePath - যেখানে সাময়িকভাবে PDF টি সেভ হবে
 */
export const generateTicketPDF = async (bookingData, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A6', margin: 30 }); // টিকিটের জন্য A6 সাইজ ভালো
        // ফাইল স্ট্রীম তৈরি
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        // --- টিকিটের ডিজাইন শুরু ---
        // হেডার / লোগো এরিয়া
        doc.rect(0, 0, doc.page.width, 60).fill('#6366f1'); // Indigo Color
        doc.fillColor('#ffffff').fontSize(18).text('EventSphere Ticket', 30, 20, { align: 'center' });
        doc.moveDown(2);
        // ইভেন্ট ডিটেইলস
        doc.fillColor('#333333').fontSize(14).text(`Event: ${bookingData.event.title}`, { underline: true });
        doc.fontSize(10).text(`Date: ${new Date(bookingData.event.date).toDateString()}`);
        doc.text(`Location: ${bookingData.event.location}`);
        doc.moveDown();
        doc.rect(doc.x, doc.y, 250, 1).fill('#eeeeee'); // ডিভাইডার লাইন
        doc.moveDown();
        // ইউজার ডিটেইলস
        doc.fillColor('#000000').fontSize(11).text(`Attendee: ${bookingData.user.name}`);
        doc.text(`Email: ${bookingData.user.email}`);
        doc.text(`Booking ID: ${bookingData.id.split('-')[0].toUpperCase()}`); // ছোট আইডি
        doc.moveDown();
        // প্রাইস এবং স্ট্যাটাস
        doc.rect(30, doc.y, 220, 30).fill('#f3f4f6');
        doc.fillColor('#1f2937').text(`Amount Paid: BDT ${bookingData.totalAmount}`, 40, doc.y - 20);
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#9ca3af').text('Please show this ticket at the entry gate.', { align: 'center' });
        // --- ডিজাইন শেষ ---
        doc.end();
        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
    });
};
