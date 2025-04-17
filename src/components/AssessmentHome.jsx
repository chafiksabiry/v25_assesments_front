import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import AssessmentDialog from './AssessmentDialog';

function AssessmentHome() {
  const navigate = useNavigate();
  const { 
    languageOptions, 
    contactCenterSkills
  } = useAssessment();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  const handleLanguageSelect = (languageId) => {
    const language = languageOptions.find(lang => lang.id === languageId);
    setSelectedLanguage(language);
    setSelectedSkill(null);
    setIsDialogOpen(true);
    // We can also navigate to keep URL state
    navigate(`/assessment/language/${languageId}`, { replace: true });
  };

  const handleContactCenterSelect = (skillId) => {
    // Find the skill object from the nested structure
    let selectedSkillObj = null;
    contactCenterSkills.forEach(category => {
      const found = category.skills.find(skill => skill.id === skillId);
      if (found) selectedSkillObj = found;
    });
    
    setSelectedSkill(selectedSkillObj);
    setSelectedLanguage(null);
    setIsDialogOpen(true);
    // We can also navigate to keep URL state
    navigate(`/assessment/contact-center/${skillId}`, { replace: true });
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLanguage(null);
    setSelectedSkill(null);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            HARX Skills Assessment Portal
          </h1>
          <p className="text-xl text-gray-600">
            Choose an assessment to begin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Language Assessments */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Language Assessments</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Assess your proficiency in different languages through interactive 
                exercises and AI evaluation.
              </p>
              
              <div className="space-y-4">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageSelect(lang.id)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{lang.language}</span>
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Center Skills Assessments */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Contact Center Skills</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Evaluate your contact center skills across different categories 
                through realistic scenarios.
              </p>
              
              <div className="space-y-6">
                {contactCenterSkills.map((category, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">{category.category}</h3>
                    <div className="space-y-2">
                      {category.skills.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => handleContactCenterSelect(skill.id)}
                          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        >
                          <span className="font-medium text-gray-800">{skill.name}</span>
                          <svg className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assessment Dialog */}
      <AssessmentDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        selectedLanguage={selectedLanguage}
        selectedSkill={selectedSkill}
      />
    </div>
  );
}

export default AssessmentHome; 