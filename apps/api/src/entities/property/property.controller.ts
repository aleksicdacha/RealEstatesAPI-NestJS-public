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
  Put,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDTO } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatsQueryDto } from './dto/property-stats.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from '@src/auth/decorators/public.decorator';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'files', maxCount: 10 }, // "files" is the field name for uploading multiple images
    ]),
  )
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.propertyService.create(createPropertyDto);
  }

  @Public()
  @Get('stats/average-price-by-type')
  async getAveragePriceByType(@Query() query: PropertyStatsQueryDto) {
    return this.propertyService.getAveragePriceByType(query);
  }

  @Public()
  @Get('filters/options')
  async getFilterOptions() {
    return this.propertyService.getFilterOptions();
  }

  /**
   * Public endpoint for user-web frontend
   * Returns sanitized property data without sensitive information
   */
  @Public()
  @Get('public')
  async findAllPublic(@Query() query: FilterPropertyDto) {
    return this.propertyService.findAllPublic(query);
  }

  /**
   * Public endpoint for similar properties (user-web frontend)
   * Returns properties similar to the given one by type, price, and location
   * MUST be before @Get('public/:guid') to avoid route conflict
   */
  @Public()
  @Get('public/:guid/similar')
  findSimilarPublic(@Param('guid') guid: string) {
    return this.propertyService.findSimilarPublic(guid);
  }

  /**
   * Public endpoint for single property (user-web frontend)
   * Returns sanitized property data without sensitive information
   * MUST be before @Get(':guid') to avoid route conflict
   */
  @Public()
  @Get('public/:guid')
  findOnePublic(@Param('guid') guid: string) {
    return this.propertyService.findOnePublic(guid);
  }

  @Get()
  async findAll(@Query() query: FilterPropertyDto) {
    return this.propertyService.findAll(query);
  }

  @Get(':guid')
  findOne(@Param('guid') guid: string) {
    return this.propertyService.findOne(guid);
  }

  // @Patch(':guid')
  // update(
  //   @Param('guid') guid: string,
  //   @Body() updatePropertyDto: UpdatePropertyDTO,
  // ) {
  //   return this.propertyService.update(guid, updatePropertyDto);
  // }

  @Put(':guid')
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
