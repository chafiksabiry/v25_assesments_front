import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';

function AssessmentCompletePage() {
  const navigate = useNavigate();
  const { assessmentResults } = useAssessment();
  
  const hasLanguageResults = Object.keys(assessmentResults.languages).length > 0;
  const hasContactCenterResults = Object.keys(assessmentResults.contactCenter).length > 0;
  
  const calculateAverageScore = (category) => {
    if (category === 'languages') {
      const scores = Object.values(assessmentResults.languages).map(lang => lang.overall.score);
      return scores.length 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
    } else if (category === 'contactCenter') {
      const scores = Object.values(assessmentResults.contactCenter).map(skill => skill.score);
      return scores.length 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
    }
    return 0;
  };
  
  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="text-center">
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Completed!</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your assessment results have been saved. Here's a summary of your performance:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {hasLanguageResults && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Language Assessment</h3>
            </div>
            <div className="p-6">
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-blue-600">
                  {calculateAverageScore('languages').toFixed(1)}%
                </span>
                <p className="text-gray-500 text-sm">Average Score</p>
              </div>
              
              <div className="space-y-4">
                {Object.entries(assessmentResults.languages).map(([lang, results]) => (
                  <div key={lang} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{lang}</h4>
                      <span className="font-bold text-blue-600">{results.overall.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${results.overall.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {hasContactCenterResults && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Contact Center Skills</h3>
            </div>
            <div className="p-6">
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-purple-600">
                  {calculateAverageScore('contactCenter').toFixed(1)}%
                </span>
                <p className="text-gray-500 text-sm">Average Score</p>
              </div>
              
              <div className="space-y-4">
                {Object.entries(assessmentResults.contactCenter).map(([skillId, results]) => (
                  <div key={skillId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{results.skill || skillId}</h4>
                        <p className="text-xs text-gray-500">{results.category}</p>
                      </div>
                      <span className="font-bold text-purple-600">{results.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${results.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        <p className="text-gray-600 mb-6">
          Your results have been saved. You can view them again or take more assessments anytime.
        </p>
        
        <button
          onClick={handleBackHome}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default AssessmentCompletePage; 