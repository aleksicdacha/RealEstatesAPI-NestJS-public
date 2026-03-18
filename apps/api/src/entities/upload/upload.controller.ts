import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

// Allowed MIME types — verified by the filter below
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;   // 5 MB per file
const MAX_FILES_PER_REQUEST = 10;

// Restrict uploads to the designated uploads directory (prevents path traversal)
const UPLOADS_DIR = resolve('./uploads');

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  // 20 uploads per 5 minutes per authenticated user
  @Throttle({ default: { limit: 20, ttl: 300000 } })
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_REQUEST, {
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, UPLOADS_DIR);
        },
        filename: (req, file, callback) => {
          const propertyCode =
            (req.query.propertyCode as string) ||
            (req.body.propertyCode as string) ||
            'UNKNOWN';
          // Strip every char that isn't alphanumeric, dash, or underscore
          const safeCode = propertyCode.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
          const ext = extname(file.originalname).toLowerCase();
          callback(null, `${safeCode}-${Date.now()}${ext}`);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: MAX_FILES_PER_REQUEST,
      },
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (
          !ALLOWED_MIME_TYPES.includes(file.mimetype) ||
          !ALLOWED_EXTENSIONS.includes(ext)
        ) {
          return callback(
            new BadRequestException(
              `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
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