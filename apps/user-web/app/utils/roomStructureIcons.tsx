import { ReactElement } from 'react';

export interface RoomStructureOption {
  value: string;
  label: string;
  labelEn: string;
  icon: ReactElement;
}

const iconClass = "w-5 h-5";

export const roomStructureOptions: RoomStructureOption[] = [
  {
    value: 'garsonjera',
    label: 'Garsonjera',
    labelEn: 'Studio',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    value: 'jednosoban',
    label: '1.0 (Jednosoban)',
    labelEn: '1.0 (One-bedroom)',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: 'dvosoban',
    label: '2.0 (Dvosoban)',
    labelEn: '2.0 (Two-bedroom)',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    value: 'trosoban',
    label: '3.0 (Trosoban)',
    labelEn: '3.0 (Three-bedroom)',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: 'četvorosoban',
    label: '4.0 (Četvorosoban)',
    labelEn: '4.0 (Four-bedroom)',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    value: 'četvoroiposoban',
    label: '4.5 (Četvoroiposoban)',
    labelEn: '4.5 (Four and half bedroom)',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: 'petosoban i veći',
    label: '5.0+ (Petosoban i veći)',
    labelEn: '5.0+ (Five or more bedrooms)',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: 'ostalo',
    label: 'Ostalo',
    labelEn: 'Other',
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
];

export function getRoomStructureIcon(structure: string | undefined): ReactElement | null {
  if (!structure) return null;
  const option = roomStructureOptions.find(opt => opt.value.toLowerCase() === structure.toLowerCase());
  return option ? option.icon : null;
}

export function getRoomStructureName(structure: string | undefined, locale: 'sr' | 'en' = 'sr'): string {
  if (!structure) return '';
  const option = roomStructureOptions.find(opt => opt.value.toLowerCase() === structure.toLowerCase());
  if (!option) return structure;
  return locale === 'en' ? option.labelEn : option.label;
}
