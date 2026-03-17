export const getStatusOptions = (t: (key: string) => string) => [
  { label: t('available'), value: 'active' },
  { label: t('reserved'), value: 'inactive' },
  { label: t('sold'), value: 'deleted' },
];