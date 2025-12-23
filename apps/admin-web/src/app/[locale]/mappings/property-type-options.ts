export const getPropertyTypeOptions = (t: (key: string) => string) => [
  { label: t('typeApartment'), value: 'Apartment' },
  { label: t('typeHouse'), value: 'House' },
  { label: t('typeApartmentInHouse'), value: 'ApartmentInHouse' },
  { label: t('typeCommercialSpace'), value: 'CommercialSpace' },
  { label: t('typeOffice'), value: 'Office' },
  { label: t('typeLand'), value: 'Land' },
  { label: t('typeVacationHome'), value: 'VacationHome' },
  { label: t('typeDuplex'), value: 'Duplex' },
];