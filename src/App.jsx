import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LanguageAssessmentPage from './pages/LanguageAssessmentPage';
import { AssessmentProvider } from './context/AssessmentContext';

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <Routes>
          {/* Route for any language name */}
          <Route path="/languages/:language" element={<LanguageAssessmentPage />} />
          
          {/* Default route - redirect to English */}
          <Route path="/" element={<Navigate to="/languages/English" replace />} />
          
          {/* Redirect any other routes to default page */}
          <Route path="*" element={<Navigate to="/languages/English" replace />} />
        </Routes>
      </Router>
    </AssessmentProvider>
  );
}

export default App;