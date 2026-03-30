import easyinvoice from 'easyinvoice';
import { IInvoicePayload } from './payment.interface';

const generateInvoicePDF = async (data: IInvoicePayload): Promise<string> => {
  const invoiceData: any = {
    "images": {
      "logo": "https://public.easyinvoice.cloud/img/logo_en_7.png" // আপনার লোগো লিঙ্ক এখানে দিন
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
    },
    "information": {
      "number": data.bookingId,
      "date": data.date,
    },
    "products": [
      {
        "quantity": "1",
        "description": data.eventName,
        "tax-rate": "0",
        "price": data.amount.toString() 
      }
    ],
    "bottom-notice": "This is a computer-generated invoice. Thank you for choosing EventSphere.",
    "settings": {
      "currency": "BDT", // এখানে 'USD' থেকে 'BDT' করা হয়েছে
      "locale": "en-US", // টাকার কমা ফরম্যাট (e.g. 1,000) ঠিক রাখার জন্য
      "margin-top": 25,
      "margin-right": 25,
      "margin-left": 25,
      "margin-bottom": 25
    }
  };

  // @ts-ignore
  const result = await easyinvoice.createInvoice(invoiceData);
  return result.pdf; // Base64 String রিটার্ন করবে
};

export const InvoiceService = {
  generateInvoicePDF
};