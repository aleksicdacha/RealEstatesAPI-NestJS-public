import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '@src/upload/upload.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly uploadService: UploadService,
  ) {}

  // This is the route to handle property creation with file uploads
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files', maxCount: 10 }, // "files" is the field name for uploading multiple images
  ]))

  async create(@Body() createPropertyDto: CreatePropertyDto, @UploadedFiles() files: Express.Multer.File[]) {

    console.log('createPropertyDto:::', createPropertyDto);
    // console.log('UPLOADED FILES:::', await this.uploadService.uploadFiles(files));

    // const uploadedFileUrls = await this.uploadService.uploadFiles(files);


    // Handle files and get their URLs
    // Add the uploaded file URLs to the createPropertyDto object
    // createPropertyDto.images = await this.uploadService.uploadFiles(files);

    // Create the property and associate the uploaded images
    return await this.propertyService.create(createPropertyDto);
  }

  @Get()
  async findAll(@Query() query: FilterPropertyDto) {
    return this.propertyService.findAll(query);
  }

  @Get(':guid')
  findOne(@Param('guid') guid: string) {
    return this.propertyService.findOne(guid);
  }

  @Patch(':guid')
  update(
    @Param('guid') guid: string,
    @Body() updatePropertyDto: UpdatePropertyDTO,
  ) {
    return this.propertyService.update(guid, updatePropertyDto);
  }

  @Delete(':guid')
  remove(@Param('guid') guid: string) {
    return this.propertyService.remove(guid);
  }
}
