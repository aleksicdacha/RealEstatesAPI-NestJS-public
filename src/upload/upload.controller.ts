import {
  Controller,
  OnModuleInit,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from '@src/auth/decorators/public.decorator';
import * as multer from 'multer';

@Controller('upload')
export class UploadController implements OnModuleInit {
  onModuleInit() {
    console.log('UploadController initialized');
  }

  @Public()
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const propertyCode =
            req.query.propertyCode || req.body.propertyCode || 'UNKNOWN';
          const safePropertyCode = propertyCode.replace(/[^a-zA-Z0-9_-]/g, '');
          const timestamp = Date.now();
          const ext = extname(file.originalname);
          callback(null, `${safePropertyCode}-${timestamp}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(new Error('File type not allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return files.map((file) => ({
      originalName: file.originalname,
      savedAs: file.filename,
      url: `/uploads/${file.filename}`,
    }));
  }
}