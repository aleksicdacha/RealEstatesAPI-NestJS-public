import { OnModuleInit } from '@nestjs/common';
export declare class UploadController implements OnModuleInit {
    onModuleInit(): void;
    uploadFiles(files: Express.Multer.File[]): Promise<{
        originalName: any;
        savedAs: any;
        url: string;
    }[]>;
}
