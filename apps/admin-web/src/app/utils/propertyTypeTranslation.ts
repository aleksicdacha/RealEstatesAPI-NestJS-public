export const translatePropertyType = (propertyType: string, t: (key: string) => string): string => {
  const typeMap: Record<string, string> = {
    'apartment': t('typeApartment'),
    'house': t('typeHouse'),
    'apartment-in-house': t('typeApartmentInHouse'),
    'commercial-space': t('typeCommercialSpace'),
    'office': t('typeOffice'),
    'land': t('typeLand'),
    'vacation-home': t('typeVacationHome'),
    'duplex': t('typeDuplex'),
  };
  
  return typeMap[propertyType] || propertyType;
};
