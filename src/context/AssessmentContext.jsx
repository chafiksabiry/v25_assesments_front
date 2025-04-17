import React, { createContext, useContext, useState } from 'react';

const AssessmentContext = createContext();

export const useAssessment = () => useContext(AssessmentContext);

export const AssessmentProvider = ({ children }) => {
  const [assessmentResults, setAssessmentResults] = useState({
    languages: {},
    contactCenter: {}
  });
  
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAssessmentType, setCurrentAssessmentType] = useState(null);
  
  // Sample language options
  const languageOptions = [
    { id: 'en', language: 'English' },
    { id: 'fr', language: 'French' },
    { id: 'es', language: 'Spanish' },
    { id: 'de', language: 'German' },
    { id: 'ar', language: 'Arabic' }
  ];
  
  // Sample contact center skills
  const contactCenterSkills = [
    { 
      category: 'Communication',
      skills: [
        { id: 'active-listening', name: 'Active Listening' },
        { id: 'clear-speech', name: 'Clear Speech' },
        { id: 'empathy', name: 'Empathy' },
        { id: 'tone-management', name: 'Tone Management' }
      ]
    },
    {
      category: 'Problem Solving',
      skills: [
        { id: 'issue-analysis', name: 'Issue Analysis' },
        { id: 'solution-finding', name: 'Solution Finding' },
        { id: 'decision-making', name: 'Decision Making' },
        { id: 'resource-utilization', name: 'Resource Utilization' }
      ]
    },
    {
      category: 'Customer Service',
      skills: [
        { id: 'service-orientation', name: 'Service Orientation' },
        { id: 'conflict-resolution', name: 'Conflict Resolution' },
        { id: 'product-knowledge', name: 'Product Knowledge' },
        { id: 'quality-assurance', name: 'Quality Assurance' }
      ]
    }
  ];
  
  // Save a language assessment result
  const saveLanguageAssessment = (languageId, results) => {
    setAssessmentResults(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [languageId]: results
      }
    }));
    
    // Here you would also call an API to save the results to the backend
    // saveLanguageToBackend(userId, languageId, results);
  };
  
  // Save a contact center skill assessment result
  const saveContactCenterAssessment = (skillId, category, results) => {
    setAssessmentResults(prev => ({
      ...prev,
      contactCenter: {
        ...prev.contactCenter,
        [skillId]: {
          category,
          ...results
        }
      }
    }));
    
    // Here you would also call an API to save the results to the backend
    // saveContactCenterToBackend(userId, skillId, category, results);
  };
  
  // Reset the current assessment state when closing dialog
  const resetAssessment = () => {
    setCurrentAssessmentType(null);
    setError(null);
    setLoading(false);
  };
  
  // Check if all assessments for a category are completed
  const isAssessmentCategoryComplete = (category) => {
    if (category === 'language') {
      // Determine if all required language assessments are completed
      // For now, we'll just check if at least one language is assessed
      return Object.keys(assessmentResults.languages).length > 0;
    } else if (category === 'contact-center') {
      // Determine if all required contact center assessments are completed
      // For now, we'll just check if at least one skill is assessed
      return Object.keys(assessmentResults.contactCenter).length > 0;
    }
    return false;
  };
  
  return (
    <AssessmentContext.Provider value={{
      assessmentResults,
      languageOptions,
      contactCenterSkills,
      currentAssessmentType,
      setCurrentAssessmentType,
      saveLanguageAssessment,
      saveContactCenterAssessment,
      isAssessmentCategoryComplete,
      loading,
      setLoading,
      error,
      setError,
      userId,
      setUserId,
      resetAssessment
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}; 