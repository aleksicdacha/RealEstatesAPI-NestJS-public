import { PropertyType } from '../../src/entities/property/enums/property-type.enum';
import { PropertyStatus } from '../../src/entities/property/enums/property-status.enum';
import { HeatingType } from '../../src/entities/property/enums/heating.enum';
import { Orientation } from '../../src/entities/property/enums/orientation.enum';

let counter = 0;

export function createMockProperty(overrides: Partial<any> = {}): any {
  counter++;
  return {
    id: `uuid-prop-${counter}`,
    code: `NIS-${String(counter).padStart(3, '0')}`,
    description: `Test property ${counter}`,
    propertyType: PropertyType.Apartment,
    status: PropertyStatus.Active,
    price: 50000 + counter * 1000,
    salePrice: 48000 + counter * 1000,
    area: 60 + counter,
    address: `Bulevar Nemanjića ${counter}, Niš`,
    neighborhood: 'Medijana',
    lat: 43.3209 + counter * 0.001,
    lon: 21.8954 + counter * 0.001,
    comment: `Internal note ${counter}`,
    elevator: true,
    additionalEquipment: ['parking', 'balcony'],
    constructionYear: 2020,
    bathrooms: 1,
    floor: 3,
    roomStructure: '2',
    heating: HeatingType.CENTRAL,
    contractNumber: `CN-${counter}`,
    cadastralParcel: `CP-${counter}`,
    cadastralMunicipality: `CM-${counter}`,
    orientation: Orientation.South,
    youtubeUrl: null,
    specialOffer: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    images: [
      {
        id: `uuid-img-${counter}-1`,
        url: `properties/NIS-${counter}/image1.jpg`,
        order: 0,
        isFavorite: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ],
    client: null,
    ...overrides,
  };
}

export function createMockPropertyImage(overrides: Partial<any> = {}): any {
  counter++;
  return {
    id: `uuid-img-${counter}`,
    url: `properties/test/image${counter}.jpg`,
    order: 0,
    isFavorite: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  };
}
