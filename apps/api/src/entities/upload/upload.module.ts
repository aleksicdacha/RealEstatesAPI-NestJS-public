import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [UploadController],
  imports: [MulterModule.register({ dest: './uploads' })],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
