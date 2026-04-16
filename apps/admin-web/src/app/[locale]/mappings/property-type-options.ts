export const getPropertyTypeOptions = (t: (key: string) => string) => [
  { label: t('typeApartment'), value: 'apartment' },
  { label: t('typeHouse'), value: 'house' },
  { label: t('typeApartmentInHouse'), value: 'apartment-in-house' },
  { label: t('typeCommercialSpace'), value: 'commercial-space' },
  { label: t('typeOffice'), value: 'office' },
  { label: t('typeLand'), value: 'land' },
  { label: t('typeVacationHome'), value: 'vacation-home' },
  { label: t('typeDuplex'), value: 'duplex' },
];