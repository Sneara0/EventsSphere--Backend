/**
 * @param bookingData - বুকিং এর ডিটেইলস (User Name, Event Name, Date, Price)
 * @param filePath - যেখানে সাময়িকভাবে PDF টি সেভ হবে
 */
export declare const generateTicketPDF: (bookingData: any, filePath: string) => Promise<void>;
