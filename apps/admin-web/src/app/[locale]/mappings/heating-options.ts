export const getHeatingOptions = (t: (key: string) => string) => [
  { label: t('heatingCentral'), value: 'Central' },
  { label: t('heatingGasCentral'), value: 'Gas central' },
  { label: t('heatingSolidFuel'), value: 'Central heating with solid fuel' },
  { label: t('heatingElectricCentral'), value: 'Electric central' },
  { label: t('heatingFloor'), value: 'Floor' },
  { label: t('heatingGasIndependent'), value: 'Independently on gas' },
  { label: t('heatingSolidFuelIndependent'), value: 'Independent on solid fuel' },
  { label: t('heatingElectricIndependent'), value: 'Independently on electricity' },
  { label: t('heatingFireplace'), value: 'Fireplace' },
  { label: t('heatingAirConditioner'), value: 'Air conditioner' },
  { label: t('heatingOther'), value: 'The rest types' },
];