import { Test, TestingModule } from '@nestjs/testing';
import { PropertyImageService } from './property-image.service';

describe('PropertyImageService', () => {
  let service: PropertyImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyImageService],
    }).compile();

    service = module.get<PropertyImageService>(PropertyImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
