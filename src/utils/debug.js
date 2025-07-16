/**
 * Debug utilities for testing passage generation stability
 * This file can be removed in production
 */

import { getCacheStats, clearSessionCache, clearLanguageCache } from './passageManager';

/**
 * Log current cache status
 */
export const logCacheStatus = () => {
  const stats = getCacheStats();
  console.group('🔍 Cache Status');
  console.log('📊 Total cached passages:', stats.totalCached);
  console.log('🎯 Session cached passages:', stats.sessionCached);
  console.log('🌐 Languages in cache:', stats.languages);
  console.log('📝 Recent passages:', stats.recentPassages.map(p => ({
    title: p.title,
    language: p.code,
    generatedAt: p.generatedAt
  })));
  console.groupEnd();
};

/**
 * Test passage stability for a specific language
 */
export const testPassageStability = async (language, getPassageFunction) => {
  console.group(`🧪 Testing passage stability for: ${language}`);
  
  try {
    // Call getPassage multiple times
    const passage1 = await getPassageFunction(language);
    const passage2 = await getPassageFunction(language);
    const passage3 = await getPassageFunction(language);
    
    const isSame12 = passage1.id === passage2.id;
    const isSame23 = passage2.id === passage3.id;
    
    console.log('🎯 First call result:', { id: passage1.id, title: passage1.title });
    console.log('🎯 Second call result:', { id: passage2.id, title: passage2.title });
    console.log('🎯 Third call result:', { id: passage3.id, title: passage3.title });
    
    if (isSame12 && isSame23) {
      console.log('✅ PASS: Same passage returned consistently');
    } else {
      console.error('❌ FAIL: Different passages returned');
    }
    
    logCacheStatus();
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.groupEnd();
};

/**
 * Clear all caches for testing
 */
export const resetTestEnvironment = () => {
  clearSessionCache();
  console.log('🧹 Test environment reset');
};

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
  window.debugPassageCache = {
    logStatus: logCacheStatus,
    testStability: testPassageStability,
    reset: resetTestEnvironment,
    clearSession: clearSessionCache,
    clearLanguage: clearLanguageCache
  };
  
  console.log('🔧 Debug tools available at: window.debugPassageCache');
} 