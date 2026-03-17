export declare class TextNormalizer {
    private static readonly CYRILLIC_TO_LATIN_MAP;
    static cyrillicToLatin(text: string): string;
    static cyrillicToLatinBatch(texts: string[]): string[];
    static normalize(text: string | null | undefined): string | null;
    static normalizeBatch(texts: (string | null | undefined)[]): string[];
}
