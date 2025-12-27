export const getOrientationOptions = (t: (key: string) => string) => [
  { label: t('orientationNorth'), value: 'north' },
  { label: t('orientationSouth'), value: 'south' },
  { label: t('orientationEast'), value: 'east' },
  { label: t('orientationWest'), value: 'west' },
  { label: t('orientationNorthEast'), value: 'northeast' },
  { label: t('orientationNorthWest'), value: 'northwest' },
  { label: t('orientationSouthEast'), value: 'southeast' },
  { label: t('orientationSouthWest'), value: 'southwest' },
];
