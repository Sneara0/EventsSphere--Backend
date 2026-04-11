// @ts-ignore
import easyinvoice from 'easyinvoice';
// Node.js এনভায়রনমেন্টে DOMMatrix এরর হ্যান্ডেল করার জন্য এই ছোট হ্যাকটি প্রয়োজন
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        static fromFloat32Array() { return new DOMMatrix(); }
        static fromFloat64Array() { return new DOMMatrix(); }
    };
}
const generateInvoicePDF = async (data) => {
    const invoiceData = {
        images: {
            logo: "https://public.easyinvoice.cloud/img/logo_en_7.png",
        },
        sender: {
            company: "EventSphere Ltd.",
            address: "Banani, Dhaka",
            zip: "1213",
            city: "Dhaka",
            country: "Bangladesh",
        },
        client: {
            company: data.userName,
            address: data.userEmail,
            zip: "TX: " + data.transactionId,
            city: "Order ID: " + data.bookingId,
            custom1: "Payment Status: Successful",
        },
        information: {
            number: data.bookingId.slice(-8).toUpperCase(),
            date: data.date,
        },
        products: [
            {
                quantity: 1,
                description: data.eventName,
                "tax-rate": 0,
                price: data.amount,
            },
        ],
        "bottom-notice": "This is a computer-generated invoice. Thank you for choosing EventSphere.",
        settings: {
            currency: "BDT",
            locale: "en-US",
            "margin-top": 25,
            "margin-right": 25,
            "margin-left": 25,
            "margin-bottom": 25,
            format: "A4",
        },
    };
    // easyinvoice.createInvoice একটি রেজাল্ট অবজেক্ট রিটার্ন করে যার ভেতর pdf (base64) থাকে
    // 'as any' ব্যবহার করা হয়েছে যাতে টাইপস্ক্রিপ্ট অবজেক্ট স্ট্রাকচার নিয়ে আপত্তি না করে
    const result = await easyinvoice.createInvoice(invoiceData);
    return result.pdf;
};
export const InvoiceService = {
    generateInvoicePDF,
};
