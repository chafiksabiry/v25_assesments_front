import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { getPassage } from '../utils/passageManager';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function LanguageAssessment({ language, onComplete, showSummary = false }) {
  const navigate = useNavigate();
  const { languageId } = useParams();
  const { 
    setLoading: setContextLoading,
    setError: setContextError
  } = useAssessment();
  
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [passage, setPassage] = useState(null);
  const [passageError, setPassageError] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [previousScores, setPreviousScores] = useState([]);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  
  // Determine which language to use - either from props or URL params
  const targetLanguage = language || languageId;
  
  useEffect(() => {
    // Load reading passage when component mounts
    const loadPassage = async () => {
      try {
        setIsTranslating(true);
        setPassageError(null);
        const passageData = await getPassage(targetLanguage);
        setPassage(passageData);
      } catch (error) {
        console.error('Error loading passage:', error);
        setPassageError(error.message);
        setPassage(null);
      } finally {
        setIsTranslating(false);
      }
    };

    if (targetLanguage) {
      loadPassage();
    }
  }, [targetLanguage]);
  
  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setContextError('Could not access microphone. Please ensure you have granted permission.');
    }
  };
  
  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Analyze the recording
  const analyzeRecording = async () => {
    setAnalyzing(true);
    try {
      // Simulate AI analysis with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a language assessment expert. Analyze the following reading passage and provide a detailed assessment with scores and feedback in the following JSON format:
            {
              "completeness": {
                "score": number (0-100),
                "feedback": "string"
              },
              "fluency": {
                "score": number (0-100),
                "feedback": "string"
              },
              "proficiency": {
                "score": number (0-100),
                "feedback": "string"
              },
              "overall": {
                "score": number (0-100),
                "strengths": "string",
                "areasForImprovement": "string"
              }
            }`
          },
          {
            role: "user",
            content: `Reading passage in ${targetLanguage}: ${passage.text}\nSimulate assessment for ${targetLanguage} language proficiency.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const assessmentResults = JSON.parse(response.choices[0].message.content);
      setResults(assessmentResults);
      setPreviousScores(prev => [...prev, assessmentResults.overall.score]);
      
      // Complete the assessment if callback provided
      if (onComplete) {
        onComplete(assessmentResults);
      }
    } catch (error) {
      console.error('Error analyzing recording:', error);
      setContextError('Error analyzing recording. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Map score to CEFR level
  const mapScoreToCEFR = (score) => {
    if (score >= 95) return 'C2 (Proficient)';
    if (score >= 80) return 'C1 (Advanced)';
    if (score >= 65) return 'B2 (Upper Intermediate)';
    if (score >= 50) return 'B1 (Intermediate)';
    if (score >= 35) return 'A2 (Elementary)';
    return 'A1 (Beginner)';
  };
  
  // Show score comparison between attempts
  const showScoreComparison = () => {
    if (previousScores.length <= 1) return null;

    const previousScore = previousScores[previousScores.length - 2];
    const currentScore = previousScores[previousScores.length - 1];
    const difference = currentScore - previousScore;

    return (
      <div className="mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Previous attempt:</span>
          <span className="font-medium">{previousScore}/100</span>
          <span className={`${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({difference >= 0 ? '+' : ''}{difference} points)
          </span>
        </div>
      </div>
    );
  };
  
  // Retake the assessment
  const retakeAssessment = () => {
    setAudioBlob(null);
    setResults(null);
    setAttempts(prev => prev + 1);
  };
  
  // Go back to assessment selection if standalone
  const handleBack = () => {
    if (navigate) {
      navigate('/');
    }
  };
  
  // If showing summary only
  if (showSummary && results) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Assessment Results
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Overall Score:</span>
            <span className="text-2xl font-bold text-blue-600">
              {results.overall.score}%
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(results)
              .filter(([key]) => key !== 'overall')
              .map(([category, data]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{category}:</span>
                  <span className="font-medium text-gray-800">{data.score}/100</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (passageError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Assessment Error</h2>
        <p className="text-gray-600 mb-6">
          {passageError}
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800">
          {targetLanguage} Language Assessment
        </h4>
        {attempts > 0 && (
          <span className="text-sm text-gray-500">
            Attempt {attempts + 1}
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Reading Passage */}
        <div className="p-6 bg-blue-50 rounded-xl">
          <h5 className="text-lg font-medium text-blue-900 mb-3">Reading Passage</h5>
          {isTranslating ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-800">Preparing assessment materials...</p>
              <p className="text-sm text-blue-600 mt-2">Translating passage to {targetLanguage}...</p>
            </div>
          ) : !passage ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="text-red-500 mb-3">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Assessment Not Available</p>
              <p className="text-blue-800">Could not load passage for {targetLanguage}</p>
              <p className="text-sm text-blue-600 mt-4">Please try again or contact support if the issue persists.</p>
            </div>
          ) : (
            <>
              <h6 className="font-medium text-blue-800 mb-3">{passage.title}</h6>
              <p className="text-blue-800 whitespace-pre-line">{passage.text}</p>
            </>
          )}
        </div>

        {/* Recording Controls - Only show if there's a passage */}
        {passage && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 ${recording
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
              >
                {recording ? (
                  <>
                    <span className="animate-pulse">⚫</span>
                    Stop Recording
                  </>
                ) : (
                  <>
                    🎤 Start Recording
                  </>
                )}
              </button>
            </div>
          
            {audioBlob && !analyzing && (
              <div className="flex flex-col items-center gap-4">
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-md" />
                <div className="flex gap-4">
                  <button
                    onClick={() => setAudioBlob(null)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={analyzeRecording}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    Analyze Recording
                  </button>
                </div>
              </div>
            )}
          
            {analyzing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your language proficiency...</p>
              </div>
            )}
          </div>
        )}
      
        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Overall Assessment Section */}
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold text-gray-900">Overall Assessment</h5>
                <span className="text-2xl font-bold text-blue-600">{results.overall.score}/100</span>
              </div>
              <p className="text-gray-800 mb-4">
                {results.overall.strengths}
              </p>
              <p className="text-gray-800">
                {results.overall.areasForImprovement}
              </p>
              {showScoreComparison()}
            </div>
            
            {/* Category scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(results)
                .filter(([key]) => key !== 'overall')
                .map(([category, data]) => (
                  <div key={category} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700 capitalize">{category}</h5>
                      <span className="font-bold text-blue-600">{data.score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{data.feedback}</p>
                  </div>
                ))}
            </div>

            {/* Retake Assessment Button */}
            {!showSummary && (
              <div className="flex justify-center">
                <button
                  onClick={retakeAssessment}
                  className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Retake Assessment</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LanguageAssessment;