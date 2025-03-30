declare module 'elevenlabs-node' {
  export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  }

  export interface TextToSpeechOptions {
    voiceId: string;
    textInput: string;
    voiceSettings?: VoiceSettings;
    modelId?: string;
    outputFormat?: string;
  }

  export default class Voice {
    constructor(options: { apiKey: string | undefined });
    textToSpeech(options: TextToSpeechOptions): Promise<Buffer>;
    getVoices(): Promise<any[]>;
  }
}