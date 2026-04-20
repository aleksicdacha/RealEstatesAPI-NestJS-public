import { TextNormalizer } from './text-normalizer.util';

describe('TextNormalizer', () => {
  describe('cyrillicToLatin', () => {
    it('converts basic Cyrillic to Latin', () => {
      expect(TextNormalizer.cyrillicToLatin('Ниш')).toBe('Niš');
      expect(TextNormalizer.cyrillicToLatin('НиШ')).toBe('NiŠ');
    });

    it('converts full Cyrillic sentence', () => {
      expect(TextNormalizer.cyrillicToLatin('Београд')).toBe('Beograd');
    });

    it('handles digraph characters Љ, Њ, Џ', () => {
      expect(TextNormalizer.cyrillicToLatin('Љубав')).toBe('Ljubav');
      expect(TextNormalizer.cyrillicToLatin('Њега')).toBe('Njega');
      expect(TextNormalizer.cyrillicToLatin('Џеп')).toBe('Džep');
    });

    it('handles Ђ and Ћ', () => {
      expect(TextNormalizer.cyrillicToLatin('Ђорђе')).toBe('Đorđe');
      expect(TextNormalizer.cyrillicToLatin('Ћуприја')).toBe('Ćuprija');
    });

    it('preserves Latin characters', () => {
      expect(TextNormalizer.cyrillicToLatin('Hello')).toBe('Hello');
    });

    it('handles mixed Cyrillic and Latin', () => {
      expect(TextNormalizer.cyrillicToLatin('Београд City')).toBe(
        'Beograd City',
      );
    });

    it('handles empty string', () => {
      expect(TextNormalizer.cyrillicToLatin('')).toBe('');
    });

    it('preserves numbers and special characters', () => {
      expect(TextNormalizer.cyrillicToLatin('Београд 123!')).toBe(
        'Beograd 123!',
      );
    });
  });

  describe('cyrillicToLatinBatch', () => {
    it('converts array of Cyrillic texts', () => {
      const result = TextNormalizer.cyrillicToLatinBatch(['Ниш', 'Београд']);
      expect(result).toEqual(['Niš', 'Beograd']);
    });

    it('handles empty array', () => {
      expect(TextNormalizer.cyrillicToLatinBatch([])).toEqual([]);
    });
  });

  describe('normalize', () => {
    it('trims and converts Cyrillic', () => {
      expect(TextNormalizer.normalize('  Београд  ')).toBe('Beograd');
    });

    it('returns null for null input', () => {
      expect(TextNormalizer.normalize(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(TextNormalizer.normalize(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(TextNormalizer.normalize('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
      expect(TextNormalizer.normalize('   ')).toBeNull();
    });

    it('handles Latin text without changes', () => {
      expect(TextNormalizer.normalize('Beograd')).toBe('Beograd');
    });
  });

  describe('normalizeBatch', () => {
    it('normalizes and filters array', () => {
      const result = TextNormalizer.normalizeBatch([
        'Београд',
        null,
        '',
        '  ',
        'Нови Сад',
      ]);
      expect(result).toEqual(['Beograd', 'Novi Sad']);
    });

    it('returns empty array when all inputs are invalid', () => {
      const result = TextNormalizer.normalizeBatch([null, undefined, '', '  ']);
      expect(result).toEqual([]);
    });

    it('handles empty array', () => {
      expect(TextNormalizer.normalizeBatch([])).toEqual([]);
    });
  });
});
