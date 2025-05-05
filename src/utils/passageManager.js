import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Base English passage that will be used as reference for translations
const REFERENCE_PASSAGE = {
  text: `The digital revolution has transformed how we live and work. In today's interconnected world, technology plays a pivotal role in shaping our daily experiences. From artificial intelligence to renewable energy, innovations continue to drive progress and create new opportunities. As we navigate these changes, it's crucial to understand both the benefits and challenges of our increasingly digital society.`,
  title: "The Digital Revolution",
  estimatedDuration: 45,
  difficulty: "intermediate",
  code: "en"
};

// In-memory cache for passages
const passageCache = new Map();

// Initialize cache with English passage
passageCache.set('en', REFERENCE_PASSAGE);

/**
 * Get language code using OpenAI
 */
const getLanguageCodeFromAI = async (language) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a language expert. Given a language name or identifier, return ONLY the corresponding ISO 639-1 two-letter language code. 
          For example:
          - "English" -> "en"
          - "français" -> "fr"
          - "中文" -> "zh"
          - "العربية" -> "ar"
          Return ONLY the two-letter code, nothing else.`
        },
        {
          role: "user",
          content: language
        }
      ],
      temperature: 0.1,
      max_tokens: 2 // We only need 2 characters
    });

    const languageCode = response.choices[0].message.content.trim().toLowerCase();
    
    // Simple validation - check if it's exactly 2 characters
    if (languageCode.length === 2 && /^[a-z]{2}$/.test(languageCode)) {
      return languageCode;
    }
    
    throw new Error(`Invalid language code returned: ${languageCode}`);
  } catch (error) {
    console.error('Error getting language code from AI:', error);
    throw new Error(`Unable to determine language code for: ${language}`);
  }
};

/**
 * Get standardized language code from various inputs
 */
const getLanguageCode = async (language) => {
  if (!language) return null;
  
  const normalizedInput = language.toLowerCase().trim();
  
  // First check if it's already a 2-letter code
  if (normalizedInput.length === 2 && /^[a-z]{2}$/.test(normalizedInput)) {
    return normalizedInput;
  }
  
  // Try to get code from name using AI
  return await getLanguageCodeFromAI(language);
};

/**
 * Translate passage to target language using OpenAI
 */
const translatePassage = async (targetLanguageCode) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to the language with ISO code ${targetLanguageCode}. 
          Also provide an appropriate title for the passage in the target language.
          Format the response as JSON: {"text": "translated text", "title": "translated title"}`
        },
        {
          role: "user",
          content: `Text to translate: "${REFERENCE_PASSAGE.text}"\nOriginal title: "${REFERENCE_PASSAGE.title}"`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const translationResult = JSON.parse(response.choices[0].message.content);
    
    // Create new passage entry
    const newPassage = {
      text: translationResult.text,
      title: translationResult.title,
      estimatedDuration: REFERENCE_PASSAGE.estimatedDuration,
      difficulty: REFERENCE_PASSAGE.difficulty,
      code: targetLanguageCode
    };

    // Cache the new translation
    passageCache.set(targetLanguageCode, newPassage);
    
    return newPassage;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed for ${targetLanguageCode}: ${error.message}`);
  }
};

/**
 * Get passage for specified language, translate if needed
 */
export const getPassage = async (language) => {
  try {
    // Get standardized language code using AI if needed
    const langCode = await getLanguageCode(language);
    if (!langCode) {
      throw new Error(`Unable to determine language code for: ${language}`);
    }

    // Check cache first
    if (passageCache.has(langCode)) {
      return passageCache.get(langCode);
    }

    // If not in cache, translate and cache
    console.log(`Translating passage to ${langCode}...`);
    return await translatePassage(langCode);

  } catch (error) {
    console.error('Error getting passage:', error);
    throw new Error(`Unable to provide passage for ${language}: ${error.message}`);
  }
};

/**
 * Check if passage exists for language
 */
export const hasPassage = (langCode) => {
  return passageCache.has(langCode);
};

/**
 * Get available language codes
 */
export const getAvailableLanguages = () => {
  return Array.from(passageCache.keys());
}; 