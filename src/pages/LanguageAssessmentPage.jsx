import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import LanguageAssessment from '../components/LanguageAssessment';
import { useAssessment } from '../context/AssessmentContext';
import { isAuthenticated, returnToParentApp, getLanguageIsoCode } from '../utils/authUtils';
import { normalizeLanguageName } from '../utils/languageUtils';
import Notification from '../components/Notification';

function LanguageAssessmentPage() {
  const { language } = useParams(); // May be undefined for new clean route
  const [searchParams] = useSearchParams();
  const { setCurrentAssessmentType, saveLanguageAssessment, setUserId } = useAssessment();
  const [notification, setNotification] = useState(null);
  
  // Get language and code from URL query parameters if provided
  // Priority: 'lang' parameter (preferred) > 'language' parameter (legacy)
  const langFromQuery = searchParams.get('lang');
  const languageFromQuery = searchParams.get('language');
  const codeFromQuery = searchParams.get('code');
  
  // Determine the effective language and code
  const effectiveLanguage = langFromQuery || languageFromQuery || language || 'English';
  const effectiveCode = codeFromQuery;
  
  // Check if we're using the new clean route (no path parameter, requires query params)
  const isCleanRoute = !language;
  const hasRequiredParams = (langFromQuery || languageFromQuery) && codeFromQuery;
  
  // Set assessment type and check authentication on mount
  useEffect(() => {
    setCurrentAssessmentType('language');
    
    // Check if the user is authenticated
    if (!isAuthenticated() && import.meta.env.VITE_RUN_MODE !== 'standalone') {
      console.warn('No authentication data found. Using demo mode.');
    }
    
    // Log the method being used
    if (isCleanRoute && hasRequiredParams) {
      if (langFromQuery) {
        console.log(`✅ Using CLEAN route with 'lang' parameter - Language: ${langFromQuery}, Code: ${codeFromQuery}`);
      } else {
        console.log(`✅ Using CLEAN route with 'language' parameter - Language: ${languageFromQuery}, Code: ${codeFromQuery}`);
      }
    } else if (langFromQuery && codeFromQuery) {
      console.log(`⚠️ Using LEGACY route with 'lang' query param - Language: ${langFromQuery}, Code: ${codeFromQuery}`);
    } else if (languageFromQuery && codeFromQuery) {
      console.log(`⚠️ Using LEGACY route with 'language' query param - Language: ${languageFromQuery}, Code: ${codeFromQuery}`);
    } else if (language) {
      // Try to get the language ISO code ahead of time using existing logic
      const isoCode = getLanguageIsoCode(language);
      console.log(`⚠️ Using OLD method - Language: ${language}, ISO code: ${isoCode || 'unknown (will be determined by API)'}`);
    } else {
      console.warn('⚠️ No language specified, using default: English');
    }
  }, [setCurrentAssessmentType, language, langFromQuery, languageFromQuery, codeFromQuery, isCleanRoute, hasRequiredParams]);
  
  // Helper function to convert score to CEFR level - copied from LanguageAssessment component
  const mapScoreToCEFR = (score) => {
    if (score >= 95) return 'C2';
    if (score >= 80) return 'C1';
    if (score >= 65) return 'B2';
    if (score >= 50) return 'B1';
    if (score >= 35) return 'A2';
    return 'A1';
  };
  
  const handleComplete = async (results) => {
    console.log('Assessment completed:', results);
    
    // Use query parameters if provided, otherwise use existing logic
    const languageParam = effectiveLanguage;
    const isoCode = effectiveCode || getLanguageIsoCode(languageParam) || results.language_code;
    
    // Get the CEFR level from the results for proficiency
    const proficiency = mapScoreToCEFR(results.overall.score);
    
    // Save results to the assessment context with the required parameters
    const success = await saveLanguageAssessment(languageParam, proficiency, results, isoCode);
    
    if (success) {
      setNotification({
        message: 'Assessment results saved successfully!',
        type: 'success'
      });
      
      // Set a brief timeout to allow the user to see the success notification before redirecting
      /* setTimeout(() => {
        returnToParentApp();
      }, 2000); */
    } else {
      setNotification({
        message: 'Results saved locally but could not be sent to server',
        type: 'warning'
      });
    }
  };
  
  // Decode URI component and normalize language name (only if we have a path parameter)
  const decodedLanguage = React.useMemo(() => {
    if (!language) return null; // No path parameter
    
    try {
      const decoded = decodeURIComponent(language);
      return decoded;
    } catch (e) {
      console.error('Error decoding language parameter:', e);
      return language;
    }
  }, [language]);

  // Get the proper language name for display
  const [displayLanguageName, setDisplayLanguageName] = useState(effectiveLanguage);
  
  // Update display name when language changes, but skip normalization if we have direct language parameter
  useEffect(() => {
    if (langFromQuery || languageFromQuery) {
      // Use the provided language name directly, no normalization needed
      const directLanguage = langFromQuery || languageFromQuery;
      setDisplayLanguageName(directLanguage);
      console.log('Using direct language parameter:', directLanguage);
    } else if (decodedLanguage) {
      // Use existing normalization logic as fallback
      const updateDisplayName = async () => {
        try {
          const name = await normalizeLanguageName(decodedLanguage);
          setDisplayLanguageName(name);
        } catch (error) {
          console.error('Error normalizing language name:', error);
          setDisplayLanguageName(decodedLanguage); // Fallback to original
        }
      };
      
      updateDisplayName();
    } else {
      // Default case
      setDisplayLanguageName('English');
    }
  }, [decodedLanguage, langFromQuery, languageFromQuery]);
  
  // Error state for clean route without required parameters
  if (isCleanRoute && !hasRequiredParams) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-red-600 text-lg font-semibold mb-2">Missing Required Parameters</h3>
            <p className="text-gray-700 mb-4">
              When using the clean route <code>/assessment/language</code>, you must provide both <code>lang</code> (or <code>language</code>) and <code>code</code> parameters.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Recommended:</strong> <code>/assessment/language?lang=English&code=en</code><br/>
              <strong>Legacy:</strong> <code>/assessment/language?language=English&code=en</code>
            </p>
            <button
              onClick={() => window.location.href = '/assessment/language?lang=English&code=en'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to English Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-700 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              {displayLanguageName} Assessment
              {isCleanRoute && hasRequiredParams && (
                <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded">
                  {langFromQuery ? 'CLEAN URL' : 'CLEAN URL (legacy param)'}
                </span>
              )}
            </h1>
            <button 
              onClick={returnToParentApp}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Exit
            </button>
          </div>
          
          <div className="p-6">
            <LanguageAssessment 
              language={effectiveLanguage} 
              displayName={displayLanguageName}
              onComplete={handleComplete}
              onExit={returnToParentApp}
            />
          </div>
        </div>
      </div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={5000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default LanguageAssessmentPage; 