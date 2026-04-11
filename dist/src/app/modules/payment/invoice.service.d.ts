export interface IInvoicePayload {
    userName: string;
    userEmail: string;
    bookingId: string;
    eventName: string;
    amount: number;
    date: string;
    transactionId: string;
}
export declare const InvoiceService: {
    generateInvoicePDF: (data: IInvoicePayload) => Promise<string>;
};
