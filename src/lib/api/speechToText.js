import { apiMultipart } from './client';

/**
 * Transcribe audio to text
 * @param {Blob} audioBlob - The audio recording blob
 * @returns {Promise<{text: string}>} - The transcribed text
 */
export const transcribeAudio = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const { data } = await apiMultipart.post('/speech-to-text/transcribe', formData);
    return data;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

/**
 * Transcribe long audio file to text
 * @param {Blob} audioBlob - The audio recording blob
 * @returns {Promise<{text: string}>} - The transcribed text
 */
export const transcribeLongAudio = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const { data } = await apiMultipart.post('/speech-to-text/transcribe-long', formData);
    return data;
  } catch (error) {
    console.error('Error transcribing long audio:', error);
    throw error;
  }
};
