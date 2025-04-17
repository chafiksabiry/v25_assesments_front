import api, { apiMultipart } from './client';

/**
 * Upload a recording for processing
 * @param {FormData} formData - Form data containing the audio file
 * @returns {Promise<{data: {fileUri: string}}>} - The URL of the uploaded recording
 */
export const uploadRecording = async (formData) => {
    try {
        const { data } = await apiMultipart.post('/audio/upload', formData);
        return { data };
    } catch (error) {
        console.error('Error uploading recording:', error);
        throw error;
    }
};

/**
 * Analyze recording using Vertex AI
 * @param {Object} data - The analysis parameters
 * @param {string} data.fileUri - The URI of the uploaded file
 * @param {string} data.textToCompare - The text to compare the audio against
 * @returns {Promise<Object>} - The analysis results
 */
export const analyzeRecordingVertex = async (data) => {
    try {
        const { data: response } = await apiMultipart.post('/vertex/analyze-speech', data);
        return response;
    } catch (error) {
        console.error('Error analyzing recording with Vertex:', error);
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