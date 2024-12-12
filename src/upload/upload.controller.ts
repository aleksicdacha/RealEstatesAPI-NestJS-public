import {
  Controller, OnModuleInit,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from '@src/auth/decorators/public.decorator';

@Controller('upload')
export class UploadController implements OnModuleInit {
  onModuleInit() {
    console.log('UploadController initialized');
  }

  @Public()
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          console.log('FILE:::', file);
          console.log('REQ:::', req);
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    // const urls = files.map((file) => `http://localhost:3000/uploads/${file.filename}`);
    // return { urls };

    if (!files || files.length === 0) {
      return { message: 'No files uploaded' };
    }

    // Log all uploaded files
    files.forEach(file => console.log(`Uploaded file: ${file.originalname}`));

    // Return the URLs of uploaded files
    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    return { fileUrls };
  }
}
