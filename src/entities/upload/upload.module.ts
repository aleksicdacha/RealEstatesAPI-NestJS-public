import { Module, OnModuleInit } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [UploadController],
  imports: [MulterModule.register({ dest: './uploads' })], // Optional if you're using Multer for file handling
  providers: [UploadService],
  exports: [UploadService], // Export UploadService so it can be used in other modules
})

export class UploadModule implements OnModuleInit {
  onModuleInit() {
    console.log('UploadModule initialized');
  }
}
