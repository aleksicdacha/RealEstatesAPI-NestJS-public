export declare class UploadController {
    uploadFiles(files: Express.Multer.File[]): Promise<{
        originalName: string;
        savedAs: string;
        url: string;
    }[]>;
}
