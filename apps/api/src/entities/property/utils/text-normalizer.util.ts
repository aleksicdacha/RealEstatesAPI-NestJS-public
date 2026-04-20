/**
 * Utility for text normalization and character conversion
 * Extracted to prevent code duplication across services
 */
export class TextNormalizer {
  private static readonly CYRILLIC_TO_LATIN_MAP: { [key: string]: string } = {
    А: 'A',
    а: 'a',
    Б: 'B',
    б: 'b',
    В: 'V',
    в: 'v',
    Г: 'G',
    г: 'g',
    Д: 'D',
    д: 'd',
    Ђ: 'Đ',
    ђ: 'đ',
    Е: 'E',
    е: 'e',
    Ж: 'Ž',
    ж: 'ž',
    З: 'Z',
    з: 'z',
    И: 'I',
    и: 'i',
    Ј: 'J',
    ј: 'j',
    К: 'K',
    к: 'k',
    Л: 'L',
    л: 'l',
    Љ: 'Lj',
    љ: 'lj',
    М: 'M',
    м: 'm',
    Н: 'N',
    н: 'n',
    Њ: 'Nj',
    њ: 'nj',
    О: 'O',
    о: 'o',
    П: 'P',
    п: 'p',
    Р: 'R',
    р: 'r',
    С: 'S',
    с: 's',
    Т: 'T',
    т: 't',
    Ћ: 'Ć',
    ћ: 'ć',
    У: 'U',
    у: 'u',
    Ф: 'F',
    ф: 'f',
    Х: 'H',
    х: 'h',
    Ц: 'C',
    ц: 'c',
    Ч: 'Č',
    ч: 'č',
    Џ: 'Dž',
    џ: 'dž',
    Ш: 'Š',
    ш: 'š',
  };

  /**
   * Converts Cyrillic text to Latin
   */
  static cyrillicToLatin(text: string): string {
    return text
      .split('')
      .map((char) => this.CYRILLIC_TO_LATIN_MAP[char] || char)
      .join('');
  }

  /**
   * Converts array of Cyrillic texts to Latin
   */
  static cyrillicToLatinBatch(texts: string[]): string[] {
    return texts.map((text) => this.cyrillicToLatin(text));
  }

  /**
   * Normalizes text: trims, converts to Latin, and filters empty strings
   */
  static normalize(text: string | null | undefined): string | null {
    if (!text) return null;
    const trimmed = text.trim();
    return trimmed.length > 0 ? this.cyrillicToLatin(trimmed) : null;
  }

  /**
   * Normalizes array of texts
   */
  static normalizeBatch(texts: (string | null | undefined)[]): string[] {
    return texts
      .map((text) => this.normalize(text))
      .filter((text): text is string => text !== null && text.length > 0);
  }
}
