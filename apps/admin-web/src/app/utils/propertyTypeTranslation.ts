export const translatePropertyType = (propertyType: string, t: (key: string) => string): string => {
  const typeMap: Record<string, string> = {
    'Apartment': t('typeApartment'),
    'House': t('typeHouse'),
    'ApartmentInHouse': t('typeApartmentInHouse'),
    'CommercialSpace': t('typeCommercialSpace'),
    'Office': t('typeOffice'),
    'Land': t('typeLand'),
    'VacationHome': t('typeVacationHome'),
    'Duplex': t('typeDuplex'),
  };
  
  return typeMap[propertyType] || propertyType;
};
