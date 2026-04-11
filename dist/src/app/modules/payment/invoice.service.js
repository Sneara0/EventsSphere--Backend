// 📂 src/app/modules/payment/invoice.service.ts
import easyinvoice from 'easyinvoice';
const generateInvoicePDF = async (data) => {
    const invoiceData = {
        "images": {
            // আপনার অরিজিনাল লোগো লিঙ্ক এখানে দিন
            "logo": "https://public.easyinvoice.cloud/img/logo_en_7.png"
        },
        "sender": {
            "company": "EventSphere Ltd.",
            "address": "Banani, Dhaka",
            "zip": "1213",
            "city": "Dhaka",
            "country": "Bangladesh"
        },
        "client": {
            "company": data.userName,
            "address": data.userEmail,
            "zip": "TX: " + data.transactionId, // ট্রানজ্যাকশন আইডি এখানে দেখানো যেতে পারে
            "city": "Order ID: " + data.bookingId,
            "custom1": "Payment: Successful"
        },
        "information": {
            "number": data.bookingId.slice(-8).toUpperCase(), // বুকিং আইডির শেষ ৮ অক্ষর ইনভয়েস নং হিসেবে
            "date": data.date,
        },
        "products": [
            {
                "quantity": "1",
                "description": data.eventName,
                "tax-rate": 0,
                "price": data.amount
            }
        ],
        "bottom-notice": "This is a computer-generated invoice. Thank you for choosing EventSphere.",
        "settings": {
            "currency": "BDT",
            "locale": "en-US",
            "margin-top": 25,
            "margin-right": 25,
            "margin-left": 25,
            "margin-bottom": 25,
            "format": "A4"
        }
    };
    // easyinvoice সরাসরি .pdf প্রপার্টিতে base64 রিটার্ন করে
    const result = await easyinvoice.createInvoice(invoiceData);
    return result.pdf;
};
export const InvoiceService = {
    generateInvoicePDF
};
