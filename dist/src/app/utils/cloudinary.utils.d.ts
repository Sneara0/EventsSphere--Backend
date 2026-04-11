/**
 * @param filePath - লোকাল temp ফোল্ডারে থাকা ফাইলের পাথ
 * @param folderName - ক্লাউডিনারিতে যে ফোল্ডারে সেভ হবে (e.g., 'eventSphere/pdfs')
 */
export declare const uploadPDFToCloudinary: (filePath: string, folderName: string) => Promise<string | undefined>;
