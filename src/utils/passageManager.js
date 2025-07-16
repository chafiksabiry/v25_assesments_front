import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// In-memory cache for passages - now uses stable keys
const passageCache = new Map();

// Session cache to ensure same text per language per session
const sessionPassageCache = new Map();

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
 * Generate a random passage in the target language using OpenAI
 */
const generateRandomPassage = async (targetLanguageCode, language, forceNew = false) => {
  try {
    // Create stable cache key for consistent experience
    const stableCacheKey = `${targetLanguageCode}_current`;
    const sessionKey = `session_${targetLanguageCode}`;
    
    // Check session cache first for consistency within the same session
    if (!forceNew && sessionPassageCache.has(sessionKey)) {
      console.log(`Using cached passage for ${language} from session cache`);
      return sessionPassageCache.get(sessionKey);
    }
    
    // Check regular cache if not forcing new generation
    if (!forceNew && passageCache.has(stableCacheKey)) {
      const cachedPassage = passageCache.get(stableCacheKey);
      // Also store in session cache for consistency
      sessionPassageCache.set(sessionKey, cachedPassage);
      console.log(`Using cached passage for ${language} from main cache`);
      return cachedPassage;
    }

    console.log(`Generating new creative passage in ${language}...`);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a creative content creator for language learning assessments. Generate an original, engaging passage in the target language.

          Guidelines:
          - Write directly in the language: ${language} (ISO code: ${targetLanguageCode})
          - Create interesting, varied content on any topic you find engaging
          - Make it suitable for reading aloud assessment
          - Length should be around 80-120 words for good assessment
          - Include natural flow and varied vocabulary
          - Choose any difficulty level and topic that feels right
          - Be creative and original - no restrictions on themes or complexity
          - Make it engaging and interesting to read
          
          Format the response as JSON: {
            "text": "the generated passage text",
            "title": "an appropriate title for the passage",
            "estimatedDuration": number (in seconds for reading aloud, typically 40-60)
          }`
        },
        {
          role: "user",
          content: `Generate a creative, original reading passage in ${language}. Be completely free in your choice of topic and style.`
        }
      ],
      temperature: 0.9, // High temperature for maximum creativity and variety
      response_format: { type: "json_object" }
    });

    const generationResult = JSON.parse(response.choices[0].message.content);
    
    // Create new passage entry
    const newPassage = {
      text: generationResult.text,
      title: generationResult.title,
      estimatedDuration: generationResult.estimatedDuration || 45,
      code: targetLanguageCode,
      generatedAt: new Date().toISOString(),
      id: `${targetLanguageCode}_${Date.now()}`
    };

    // Cache the new passage with stable key
    passageCache.set(stableCacheKey, newPassage);
    
    // Also cache in session for consistency
    sessionPassageCache.set(sessionKey, newPassage);
    
    console.log(`New passage generated and cached for ${language}`);
    
    return newPassage;
  } catch (error) {
    console.error('Passage generation error:', error);
    throw new Error(`Passage generation failed for ${language}: ${error.message}`);
  }
};

/**
 * Get passage for specified language, generate if needed
 */
export const getPassage = async (language, forceNew = false) => {
  try {
    // Get standardized language code using AI if needed
    const langCode = await getLanguageCode(language);
    if (!langCode) {
      throw new Error(`Unable to determine language code for: ${language}`);
    }

    // Generate a passage (will use cache unless forceNew is true)
    return await generateRandomPassage(langCode, language, forceNew);

  } catch (error) {
    console.error('Error getting passage:', error);
    throw new Error(`Unable to provide passage for ${language}: ${error.message}`);
  }
};

/**
 * Generate a new passage for the same language (for retakes with different content)
 */
export const getNewPassage = async (language) => {
  return await getPassage(language, true);
};

/**
 * Check if passage exists for language in cache
 */
export const hasPassage = (langCode) => {
  const stableCacheKey = `${langCode}_current`;
  return passageCache.has(stableCacheKey);
};

/**
 * Get available language codes from cache
 */
export const getAvailableLanguages = () => {
  const cachedKeys = Array.from(passageCache.keys());
  const langCodes = [...new Set(cachedKeys.map(key => key.split('_')[0]))];
  return langCodes;
};

/**
 * Clear cache for a specific language (useful for testing)
 */
export const clearLanguageCache = (langCode) => {
  const stableCacheKey = `${langCode}_current`;
  const sessionKey = `session_${langCode}`;
  passageCache.delete(stableCacheKey);
  sessionPassageCache.delete(sessionKey);
};

/**
 * Clear session cache (useful when user wants fresh content)
 */
export const clearSessionCache = () => {
  sessionPassageCache.clear();
  console.log('Session cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    totalCached: passageCache.size,
    sessionCached: sessionPassageCache.size,
    languages: getAvailableLanguages(),
    recentPassages: Array.from(passageCache.values()).slice(-5) // Last 5 passages
  };
}; 