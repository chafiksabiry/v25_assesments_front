import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LanguageAssessmentPage from './pages/LanguageAssessmentPage';
import ContactCenterAssessmentPage from './pages/ContactCenterAssessmentPage';
import { AssessmentProvider } from './context/AssessmentContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TopBar from './components/TopBar';
import { initializeAuth } from './utils/authUtils';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';


function App() {
  // Set basename based on run mode
  const isStandaloneMode = import.meta.env.VITE_RUN_MODE === 'standalone';
  const basename = isStandaloneMode ? '/' : '/repassessments';

  // Initialize authentication on component mount
  useEffect(() => {
    const { userId, token } = initializeAuth();
    console.log('Authentication initialized:', userId ? 'User authenticated' : 'No user ID');
  }, []);
  
  return (
    <AuthProvider>
      <AssessmentProvider>
        <Router basename={basename}>
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <TopBar />
              <div className="flex-1">
                <Routes>
                  {/* Language assessment route with query parameters */}
                  <Route path="/assessment/language" element={<LanguageAssessmentPage />} />
                  
                  {/* Contact center assessment route */}
                  <Route path="/assessment/contact-center/:skillId" element={<ContactCenterAssessmentPage />} />
                  
                  {/* Default redirects using proper query parameter syntax */}
                  <Route path="/" element={<Navigate to="/assessment/language?lang=English&code=en" replace />} />
                  <Route path="*" element={<Navigate to="/assessment/language?lang=English&code=en" replace />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        </Router>
      </AssessmentProvider>
    </AuthProvider>
  );
}

export default App;