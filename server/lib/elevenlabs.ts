// @ts-ignore - elevenlabs-node doesn't have type definitions
import Voice from 'elevenlabs-node';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Initialize ElevenLabs with API key
const elevenlabs = new Voice({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

// Directory to store generated audio files
const AUDIO_DIR = path.join(process.cwd(), 'uploads', 'audio');

// Ensure the audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Map of historical figures to voice IDs
// These are example voice IDs - you'll need to replace with actual ElevenLabs voice IDs
// or use your own predefined voices or default voices
const figureToVoiceMap: Record<string, string> = {
  // Male voices
  'Albert Einstein': 'TxGEqnHWrfWFTfGW9XjX',    // Josh - Friendly, mature male
  'Leonardo da Vinci': 'VR6AewLTigWG4xSOukaG',  // Arnold - Warm, thoughtful
  'Nikola Tesla': 'ErXwobaYiN019PkySvjV',       // Antoni - Confident, strong
  'Socrates': 'pNInz6obpgDQGcFmaJgB',           // Adam - Philosophical tone
  'Confucius': 'N2lVS1w4EtoT3dr4eOWO',          // Ethan - Calm, wise
  'Martin Luther King Jr.': 'ODq5zmih8GrVes37Dizd', // Domi - Powerful, moving
  'Mahatma Gandhi': 'SOYHLrjzK2X1ezoPC6cr',     // Colin - Gentle, thoughtful
  'Abraham Lincoln': 'jsCqWAovK2LkecY7zXl4',    // Callum - Distinguished
  'William Shakespeare': 'ZQe5CZNOzWyzPSCn5a3c', // Patrick - Theatrical
  'Nelson Mandela': 'bVMeCyTHy58xNoL34h3p',     // Daniel - Dignified
  'Galileo Galilei': 'flq6f7yk4E4fJM5XTYuZ',    // Thomas - Formal, scholarly
  
  // Female voices
  'Marie Curie': 'EXAVITQu4vr4xnSDxMaL',        // Charlotte - Confident
  'Cleopatra': 'jBpfuIE2acCO8z3wKNLl',          // Grace - Elegant, commanding
  'Joan of Arc': 'MF3mGyEYCl7XYWbV9V6O',        // Elli - Youthful, determined
  'Amelia Earhart': '21m00Tcm4TlvDq8ikWAM',     // Rachel - Adventurous
  'Frida Kahlo': 'AZnzlk1XvdvUeBnXmlld',        // Domi - Artistic, passionate
  'Aretha Franklin': 'z9fAnlkpzviPz146aGWa',    // Bella - Soulful
  'Ada Lovelace': 'XB0fDUnXU5powFXDhCwa',       // Emily - Thoughtful
  'Elizabeth I': 'D38z5RcWu1voky8WS1ja',        // Sarah - Regal
  'Mary Shelley': '29vD33N1CtxCmqQRPOHJ',       // Gigi - Creative, gothic
  'Catherine the Great': 'oWAxZDx7w5VEj9dCyTzz', // Dorothy - Authoritative
  'Rosa Parks': 'IKne3meq5aSn9XLyUdCD',         // Freya - Determined, dignified
  
  // Default voices for unmatched names
  'default_male': 'ErXwobaYiN019PkySvjV',        // Antoni 
  'default_female': 'EXAVITQu4vr4xnSDxMaL'       // Charlotte
};

// Voice settings for different historical personalities
const defaultVoiceSettings: VoiceSettings = {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

// Function to generate voice for a historical figure
export async function generateVoiceResponse(
  text: string,
  figureName: string
): Promise<string> {
  try {
    // Get the voice ID for this figure, or use default voice
    let voiceId = figureToVoiceMap[figureName];
    if (!voiceId) {
      // Simple gender detection based on common female names ending with 'a'
      // This is just a fallback and not completely accurate
      voiceId = figureName.endsWith('a') 
        ? figureToVoiceMap.default_female 
        : figureToVoiceMap.default_male;
    }

    // Generate a unique filename based on text content and figure name
    const hash = crypto.createHash('md5').update(`${figureName}-${text}`).digest('hex');
    const fileName = `${hash}.mp3`;
    const filePath = path.join(AUDIO_DIR, fileName);
    
    // Check if we've already generated this audio
    if (fs.existsSync(filePath)) {
      console.log(`Using cached audio file: ${fileName}`);
      return `/uploads/audio/${fileName}`;
    }
    
    // Generate audio with ElevenLabs
    const audioBuffer = await elevenlabs.textToSpeech({
      // Required parameters
      voiceId,
      textInput: text,
      // Optional parameters
      voiceSettings: defaultVoiceSettings,
      modelId: 'eleven_turbo_v2', // Use newest model
      outputFormat: 'mp3_44100_128',
    });
    
    // Save the audio file
    fs.writeFileSync(filePath, audioBuffer);
    
    // Return the URL to the audio file
    return `/uploads/audio/${fileName}`;
  } catch (error) {
    console.error('Error generating voice response:', error);
    // Return empty string on error
    return '';
  }
}

// Parse a subtitle or highlighted segment from text
export function extractHighlight(text: string, maxLength = 150): string {
  // If text is shorter than max length, return it as is
  if (text.length <= maxLength) return text;
  
  // Try to find a good breaking point - end of sentence
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let highlight = '';
  
  // Build highlight from sentences until we approach max length
  for (const sentence of sentences) {
    if ((highlight + sentence).length <= maxLength) {
      highlight += sentence;
    } else {
      break;
    }
  }
  
  // If no good sentence breaks, just cut at max length
  if (!highlight) {
    highlight = text.substring(0, maxLength) + '...';
  }
  
  return highlight;
}

// List the available voice IDs from ElevenLabs
export async function listAvailableVoices() {
  try {
    const voices = await elevenlabs.getVoices();
    return voices;
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    return [];
  }
}