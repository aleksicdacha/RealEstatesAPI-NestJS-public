import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  // This function takes the uploaded files and processes them
  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    // Optionally save to the database or perform other logic here

    return files.map((file) => {
      // You can store file URLs in a specific location, like in S3 or your local directory
      return `/uploads/${file.filename}`;
    });
  }
}
