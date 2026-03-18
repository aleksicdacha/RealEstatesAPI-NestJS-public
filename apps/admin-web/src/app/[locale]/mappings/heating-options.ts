export const getHeatingOptions = (t: (key: string) => string) => [
  { label: t('heatingCentral'), value: 'central' },
  { label: t('heatingGasCentral'), value: 'gas-central' },
  { label: t('heatingSolidFuel'), value: 'solid-fuel-central' },
  { label: t('heatingElectricCentral'), value: 'electric-central' },
  { label: t('heatingFloor'), value: 'floor' },
  { label: t('heatingGasIndependent'), value: 'independent-on-gas' },
  { label: t('heatingSolidFuelIndependent'), value: 'independent-on-solid-fuel' },
  { label: t('heatingElectricIndependent'), value: 'independent-on-electricity' },
  { label: t('heatingFireplace'), value: 'fireplace' },
  { label: t('heatingAirConditioner'), value: 'air-conditioner' },
  { label: t('heatingOther'), value: 'other' },
];