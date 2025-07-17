/**
 * Language code to full name mapping
 * Maps ISO 639-1 two-letter codes to English language names
 */
const LANGUAGE_CODE_TO_NAME = {
  // Major world languages
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'el': 'Greek',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sr': 'Serbian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'kk': 'Kazakh',
  'ky': 'Kyrgyz',
  'uz': 'Uzbek',
  'mn': 'Mongolian',
  'ne': 'Nepali',
  'si': 'Sinhala',
  'ta': 'Tamil',
  'te': 'Telugu',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'bn': 'Bengali',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'fa': 'Persian',
  'ps': 'Pashto',
  'ku': 'Kurdish',
  'am': 'Amharic',
  'ti': 'Tigrinya',
  'om': 'Oromo',
  'so': 'Somali',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'xh': 'Xhosa',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'eu': 'Basque',
  'ca': 'Catalan',
  'gl': 'Galician',
  'is': 'Icelandic',
  'ga': 'Irish',
  'mt': 'Maltese',
  'cy': 'Welsh',
  'br': 'Breton',
  'gd': 'Scottish Gaelic',
  'fo': 'Faroese',
  'lb': 'Luxembourgish',
  'rm': 'Romansh',
  'mi': 'Maori',
  'sm': 'Samoan',
  'to': 'Tongan',
  'fj': 'Fijian',
  'haw': 'Hawaiian',
  'mg': 'Malagasy',
  'ny': 'Chichewa',
  'sn': 'Shona',
  'st': 'Sesotho',
  'tn': 'Setswana',
  'ts': 'Tsonga',
  've': 'Venda',
  'ss': 'Swati',
  'nr': 'Ndebele',
  'nso': 'Northern Sotho',
  'wo': 'Wolof',
  'yo': 'Yoruba',
  'ig': 'Igbo',
  'ha': 'Hausa',
  'ff': 'Fulah',
  'lg': 'Luganda',
  'rw': 'Kinyarwanda',
  'rn': 'Kirundi',
  'ln': 'Lingala',
  'sg': 'Sango',
  'kg': 'Kongo',
  'ak': 'Akan',
  'tw': 'Twi',
  'bm': 'Bambara',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'dz': 'Dzongkha',
  'bo': 'Tibetan',
  'ug': 'Uyghur',
  'yi': 'Yiddish',
  'ji': 'Yiddish', // Alternative code
  'eo': 'Esperanto',
  'ia': 'Interlingua',
  'ie': 'Interlingue',
  'io': 'Ido',
  'vo': 'Volapük',
  'la': 'Latin',
  'sa': 'Sanskrit',
  'pi': 'Pali',
  'grc': 'Ancient Greek',
  'got': 'Gothic',
  'non': 'Old Norse',
  'gmh': 'Middle High German',
  'ang': 'Old English',
  'sga': 'Old Irish',
  'goh': 'Old High German',
  'osx': 'Old Saxon',
  'chu': 'Church Slavonic'
};

/**
 * Convert language code to full language name in English using OpenAI
 * @param {string} languageCode - ISO 639-1 language code
 * @returns {Promise<string>} Full language name in English
 */
const getLanguageNameFromAI = async (languageCode) => {
  try {
    // Import OpenAI dynamically to avoid circular dependencies
    const { default: OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a language expert. Given an ISO 639-1 language code, return ONLY the corresponding full language name in English.
          For example:
          - "fr" -> "French"
          - "ar" -> "Arabic"
          - "tr" -> "Turkish"
          - "sw" -> "Swahili"
          Return ONLY the language name, nothing else.`
        },
        {
          role: "user",
          content: languageCode
        }
      ],
      temperature: 0.1,
      max_tokens: 20
    });

    const languageName = response.choices[0].message.content.trim();
    
    // Basic validation - should be a reasonable language name
    if (languageName && languageName.length > 1 && languageName.length < 50) {
      return languageName;
    }
    
    throw new Error(`Invalid language name returned: ${languageName}`);
  } catch (error) {
    console.error('Error getting language name from AI:', error);
    // Fallback to uppercase code if AI fails
    return languageCode.toUpperCase();
  }
};

/**
 * Convert language code to full language name in English
 * Uses predefined map first, then OpenAI as fallback
 * @param {string} languageCode - ISO 639-1 language code (e.g., 'fr', 'ar', 'tr')
 * @returns {Promise<string>|string} Full language name in English
 */
export const getLanguageNameFromCode = async (languageCode) => {
  if (!languageCode) return 'Unknown Language';
  
  const normalizedCode = languageCode.toLowerCase().trim();
  
  // First, try the predefined map (fast)
  if (LANGUAGE_CODE_TO_NAME[normalizedCode]) {
    return LANGUAGE_CODE_TO_NAME[normalizedCode];
  }
  
  // If not found in map, use OpenAI as fallback (intelligent)
  console.log(`Language code "${normalizedCode}" not found in predefined map, using OpenAI fallback...`);
  return await getLanguageNameFromAI(normalizedCode);
};

/**
 * Get language name from either code or full name
 * This function handles both cases: when we receive a code or when we receive a full name
 * @param {string} input - Either a language code or full language name
 * @returns {Promise<string>} Full language name in English
 */
export const normalizeLanguageName = async (input) => {
  if (!input) return 'English';
  
  const trimmedInput = input.trim();
  
  // If it's already a full name (more than 2 characters), return as is
  if (trimmedInput.length > 2) {
    // Capitalize first letter
    return trimmedInput.charAt(0).toUpperCase() + trimmedInput.slice(1).toLowerCase();
  }
  
  // If it's 2 characters or less, treat as language code
  return await getLanguageNameFromCode(trimmedInput);
};

/**
 * Check if input is a language code (2-3 characters)
 * @param {string} input - Input to check
 * @returns {boolean} True if input appears to be a language code
 */
export const isLanguageCode = (input) => {
  if (!input) return false;
  const trimmed = input.trim();
  return trimmed.length >= 2 && trimmed.length <= 3 && /^[a-zA-Z]+$/.test(trimmed);
};

/**
 * Get all supported language codes
 * @returns {string[]} Array of supported language codes
 */
export const getSupportedLanguageCodes = () => {
  return Object.keys(LANGUAGE_CODE_TO_NAME);
};

/**
 * Get all supported language names
 * @returns {string[]} Array of supported language names
 */
export const getSupportedLanguageNames = () => {
  return Object.values(LANGUAGE_CODE_TO_NAME);
};