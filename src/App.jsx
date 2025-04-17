import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AssessmentHome from './components/AssessmentHome';
import { AssessmentProvider } from './context/AssessmentContext';

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AssessmentHome />} />
          <Route path="/assessment/language/:languageId" element={<AssessmentHome />} />
          <Route path="/assessment/contact-center/:skillId" element={<AssessmentHome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AssessmentProvider>
  );
}

export default App;