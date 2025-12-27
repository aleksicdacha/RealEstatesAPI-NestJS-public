import { OnModuleInit } from '@nestjs/common';
export declare class UploadController implements OnModuleInit {
    onModuleInit(): void;
    uploadFiles(files: Express.Multer.File[]): Promise<{
        originalName: string;
        savedAs: string;
        url: string;
    }[]>;
}
