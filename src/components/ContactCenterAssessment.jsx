import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import OpenAI from 'openai';
import { transcribeLongAudio } from '../lib/api/speechToText';
import { uploadRecording } from '../lib/api/vertex';
import { analyzeContentCenterSkill } from '../lib/api/vertex';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function ContactCenterAssessment() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { 
    contactCenterSkills, 
    saveContactCenterAssessment,
    setLoading,
    setError
  } = useAssessment();
  
  // Find the current skill and category
  const flatSkills = contactCenterSkills.flatMap(cat => 
    cat.skills.map(skill => ({ ...skill, category: cat.category }))
  );
  const currentSkill = flatSkills.find(skill => skill.id === skillId);
  
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [response, setResponse] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLocalLoading] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  
  useEffect(() => {
    if (!scenario) {
      generateScenario();
    }
  }, []);
  
  // Generate a scenario for the skill
  const generateScenario = async () => {
    setLocalLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Create a realistic contact center scenario to test ${currentSkill?.name || 'customer service'} skills. Include:
            1. Customer situation/problem
            2. Key challenges
            3. Expected response elements
            4. Evaluation criteria
            
            Format as JSON:
            {
              "scenario": "string",
              "customerProfile": "string",
              "challenge": "string",
              "expectedElements": ["string"],
              "evaluationCriteria": ["string"],
              "difficulty": "string"
            }`
          },
          {
            role: "user",
            content: `Generate a scenario for testing ${currentSkill?.name || 'customer service'} in ${currentSkill?.category || 'Customer Service'}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const scenarioData = JSON.parse(response.choices[0].message.content);
      setScenario(scenarioData);
    } catch (error) {
      console.error('Error generating scenario:', error);
      setError('Error generating scenario. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
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
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        // Release microphone access
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please ensure you have granted permission.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };
  
  // Handle text response change
  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };
  
  // Analyze the response
  const analyzeResponse = async () => {
    if (!response.trim() && !audioBlob) {
      setError('Please provide a response or recording before analyzing.');
      return;
    }
    
    setAnalyzing(true);
    try {
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert contact center trainer. Analyze the agent's response based on ${currentSkill?.name || 'customer service'} criteria.
            Provide detailed feedback in JSON format:
            {
              "score": number (0-100),
              "strengths": ["string"],
              "improvements": ["string"],
              "feedback": "string",
              "tips": ["string"],
              "keyMetrics": {
                "professionalism": number (0-100),
                "effectiveness": number (0-100),
                "customerFocus": number (0-100)
              }
            }`
          },
          {
            role: "user",
            content: `Scenario: ${scenario.scenario}\nAgent's Response: ${response}\nEvaluation Criteria: ${JSON.stringify(scenario.evaluationCriteria)}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const feedback = JSON.parse(analysisResponse.choices[0].message.content);
      setResults(feedback);
      
      // Save results to context
      if (currentSkill) {
        saveContactCenterAssessment(
          currentSkill.id, 
          currentSkill.category, 
          feedback
        );
      }
    } catch (error) {
      console.error('Error analyzing response:', error);
      setError('Error analyzing your response. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Map score to proficiency level
  const mapScoreToProficiency = (score) => {
    if (score >= 90) return 'Expert';
    if (score >= 75) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    if (score >= 40) return 'Basic';
    return 'Novice';
  };
  
  // Navigate back to the home page
  const handleBack = () => {
    navigate('/');
  };
  
  // Reset the assessment
  const handleReset = () => {
    setAudioBlob(null);
    setResponse('');
    setResults(null);
    generateScenario();
  };
  
  if (!currentSkill) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Skill Not Found</h2>
        <p className="text-gray-600 mb-6">
          Sorry, the requested skill assessment is not available.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {currentSkill.name} Assessment
      </h2>
      <p className="text-gray-600 mb-6">
        Category: {currentSkill.category}
      </p>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Generating scenario...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {scenario && !results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Scenario</h3>
              <div className="bg-purple-50 p-5 rounded-lg mb-6">
                <p className="text-lg text-gray-800 leading-relaxed">{scenario.scenario}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Customer Profile</h4>
                  <p className="text-gray-600">{scenario.customerProfile}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Key Challenge</h4>
                  <p className="text-gray-600">{scenario.challenge}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Expected Response Elements</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {scenario.expectedElements.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Response</h3>
                
                <div className="space-y-4">
                  <textarea
                    value={response}
                    onChange={handleResponseChange}
                    placeholder="Type your response to the customer here..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {response ? `${response.length} characters` : 'Or record your response'}
                    </div>
                    
                    <div className="space-x-2">
                      {!recording && !audioBlob && (
                        <button
                          onClick={startRecording}
                          className="py-2 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Record Audio Response
                        </button>
                      )}
                      
                      {recording && (
                        <button
                          onClick={stopRecording}
                          className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                          Stop Recording
                        </button>
                      )}
                      
                      {audioBlob && (
                        <div className="flex items-center gap-2">
                          <audio src={URL.createObjectURL(audioBlob)} controls className="h-10" />
                          <button
                            onClick={() => setAudioBlob(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={analyzeResponse}
                      disabled={analyzing}
                      className={`py-2 px-6 rounded-lg ${
                        analyzing 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white transition-colors`}
                    >
                      {analyzing ? 'Analyzing...' : 'Submit Response'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {analyzing && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Analyzing your response...</p>
            </div>
          )}
          
          {results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Assessment Results</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Proficiency Level:</span>
                  <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                    {mapScoreToProficiency(results.score)}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800">Overall Score</span>
                  <span className="text-2xl font-bold text-purple-600">{results.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${results.score}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">Professionalism</h4>
                    <span className="font-bold text-purple-600">{results.keyMetrics.professionalism}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full" 
                      style={{ width: `${results.keyMetrics.professionalism}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">Effectiveness</h4>
                    <span className="font-bold text-purple-600">{results.keyMetrics.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full" 
                      style={{ width: `${results.keyMetrics.effectiveness}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">Customer Focus</h4>
                    <span className="font-bold text-purple-600">{results.keyMetrics.customerFocus}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full" 
                      style={{ width: `${results.keyMetrics.customerFocus}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-600">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Areas for Improvement</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.improvements.map((improvement, index) => (
                      <li key={index} className="text-gray-600">{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Feedback</h4>
                <p className="text-gray-600">{results.feedback}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Tips for Improvement</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {results.tips.map((tip, index) => (
                    <li key={index} className="text-gray-600">{tip}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Another Scenario
                </button>
                <button
                  onClick={handleBack}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContactCenterAssessment;