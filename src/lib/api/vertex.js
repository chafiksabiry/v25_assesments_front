import api, { apiMultipart } from './client';


export const analyzeRecordingVertex = async (analyzeData) => {
    try {
        const responseData = await api.post('/vertex/language/evaluate', analyzeData);
        return responseData.data.candidates[0].content.parts[0].text;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Upload a recording for processing
 * @param {Blob} audioBlob - The audio recording blob
 * @returns {Promise<{url: string}>} - The URL of the uploaded recording
 */
export const uploadRecording = async (audioBlob) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        const { data } = await apiMultipart.post('/audio/upload', formData);
        return data;
    } catch (error) {
        console.error('Error uploading recording:', error);
        throw error;
    }
};

/**
 * Analyze contact center skills using Vertex AI
 * @param {Object} params - The analysis parameters
 * @param {string} params.skillId - The ID of the skill to analyze
 * @param {string} params.text - The text to analyze
 * @param {string} [params.audioUrl] - Optional URL of an audio recording
 * @returns {Promise<Object>} - The analysis results
 */
export const analyzeContentCenterSkill = async ({ skillId, text, audioUrl }) => {
    try {
        const { data } = await apiMultipart.post('/vertex/analyze-contact-center', {
            skillId,
            text,
            audioUrl
        });
        return data;
    } catch (error) {
        console.error('Error analyzing contact center skill:', error);
        throw error;
    }
};