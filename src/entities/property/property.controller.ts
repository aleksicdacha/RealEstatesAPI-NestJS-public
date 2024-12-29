import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
  ) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files', maxCount: 10 }, // "files" is the field name for uploading multiple images
  ]))

  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[]) {
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
