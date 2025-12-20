import { Test, TestingModule } from '@nestjs/testing';
import { PropertyImageController } from './property-image.controller';

describe('PropertyImageController', () => {
  let controller: PropertyImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyImageController],
    }).compile();

    controller = module.get<PropertyImageController>(PropertyImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
