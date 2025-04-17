import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';

function AssessmentLayout() {
  const navigate = useNavigate();
  const { 
    currentAssessmentType, 
    assessmentResults, 
    isAssessmentCategoryComplete 
  } = useAssessment();

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress on this assessment will be lost.')) {
      navigate('/');
    }
  };

  const handleComplete = () => {
    // Here we would typically save data to the database
    // For now, we'll just redirect to the completion page
    navigate('/assessment/complete');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">HARX Assessment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exit Assessment
              </button>
              {currentAssessmentType && isAssessmentCategoryComplete(currentAssessmentType) && (
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Complete & Save Results
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow overflow-hidden min-h-[80vh]">
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HARX Assessment Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AssessmentLayout; 