"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNormalizer = void 0;
class TextNormalizer {
    static CYRILLIC_TO_LATIN_MAP = {
        'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
        'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Ђ': 'Đ', 'ђ': 'đ',
        'Е': 'E', 'е': 'e', 'Ж': 'Ž', 'ж': 'ž', 'З': 'Z', 'з': 'z',
        'И': 'I', 'и': 'i', 'Ј': 'J', 'ј': 'j', 'К': 'K', 'к': 'k',
        'Л': 'L', 'л': 'l', 'Љ': 'Lj', 'љ': 'lj', 'М': 'M', 'м': 'm',
        'Н': 'N', 'н': 'n', 'Њ': 'Nj', 'њ': 'nj', 'О': 'O', 'о': 'o',
        'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
        'Т': 'T', 'т': 't', 'Ћ': 'Ć', 'ћ': 'ć', 'У': 'U', 'у': 'u',
        'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'C', 'ц': 'c',
        'Ч': 'Č', 'ч': 'č', 'Џ': 'Dž', 'џ': 'dž', 'Ш': 'Š', 'š': 'š'
    };
    static cyrillicToLatin(text) {
        return text.split('').map(char => this.CYRILLIC_TO_LATIN_MAP[char] || char).join('');
    }
    static cyrillicToLatinBatch(texts) {
        return texts.map(text => this.cyrillicToLatin(text));
    }
    static normalize(text) {
        if (!text)
            return null;
        const trimmed = text.trim();
        return trimmed.length > 0 ? this.cyrillicToLatin(trimmed) : null;
    }
    static normalizeBatch(texts) {
        return texts
            .map(text => this.normalize(text))
            .filter((text) => text !== null && text.length > 0);
    }
}
exports.TextNormalizer = TextNormalizer;
//# sourceMappingURL=text-normalizer.util.js.map