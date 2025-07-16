import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// In-memory cache for passages
const passageCache = new Map();

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
    // Create a unique cache key based on timestamp and random number for variety
    const randomId = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now();
    const cacheKey = `${targetLanguageCode}_${randomId}_${timestamp}`;
    
    // Only use cache if not forcing new generation and we want to prevent immediate duplicates
    if (!forceNew && passageCache.size > 0) {
      // Check if we have a recent passage for this language (within last 5 minutes)
      const recentKeys = Array.from(passageCache.keys()).filter(key => {
        if (!key.startsWith(`${targetLanguageCode}_`)) return false;
        const keyTimestamp = parseInt(key.split('_')[2]);
        return (timestamp - keyTimestamp) < 300000; // 5 minutes
      });
      
      if (recentKeys.length > 0) {
        const recentKey = recentKeys[recentKeys.length - 1];
        return passageCache.get(recentKey);
      }
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
      id: randomId
    };

    // Cache the new passage
    passageCache.set(cacheKey, newPassage);
    
    // Clean old cache entries to prevent memory bloat (keep only last 10 per language)
    const languageKeys = Array.from(passageCache.keys())
      .filter(key => key.startsWith(`${targetLanguageCode}_`))
      .sort((a, b) => {
        const timestampA = parseInt(a.split('_')[2]);
        const timestampB = parseInt(b.split('_')[2]);
        return timestampB - timestampA; // Most recent first
      });
    
    // Remove old entries, keep only the 10 most recent
    if (languageKeys.length > 10) {
      const keysToDelete = languageKeys.slice(10);
      keysToDelete.forEach(key => passageCache.delete(key));
    }
    
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

    // Generate a new random passage
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
  const cachedKeys = Array.from(passageCache.keys());
  return cachedKeys.some(key => key.startsWith(`${langCode}_`));
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
  const keysToDelete = Array.from(passageCache.keys()).filter(key => key.startsWith(`${langCode}_`));
  keysToDelete.forEach(key => passageCache.delete(key));
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    totalCached: passageCache.size,
    languages: getAvailableLanguages(),
    recentPassages: Array.from(passageCache.values()).slice(-5) // Last 5 passages
  };
}; 