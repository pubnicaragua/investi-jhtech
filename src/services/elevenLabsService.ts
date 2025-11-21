import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

const ELEVENLABS_API_KEY = Constants.expoConfig?.extra?.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export type VoiceGender = 'female' | 'male';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface ElevenLabsVoice {
  id: string;
  name: string;
  category: string;
  gender: VoiceGender;
  description: string;
}

class ElevenLabsService {
  private voiceSettings: VoiceSettings = {
    stability: 0.75,
    similarity_boost: 0.75,
  };

  private voiceMap: Record<VoiceGender, string> = {
    female: Constants.expoConfig?.extra?.ELEVENLABS_VOICE_ID_FEMALE || process.env.ELEVENLABS_VOICE_ID_FEMALE || '21m00Tcm4TlvDq8ikWAM',
    male: Constants.expoConfig?.extra?.ELEVENLABS_VOICE_ID_MALE || process.env.ELEVENLABS_VOICE_ID_MALE || 'EXAVITQu4vr4xnSDxMaL',
  };

  /**
   * Convertir texto a voz usando ElevenLabs
   */
  async textToSpeech(
    text: string,
    voiceGender: VoiceGender = 'female',
    speed: number = 1.0
  ): Promise<string> {
    try {
      const voiceId = this.voiceMap[voiceGender];

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: this.voiceSettings.stability,
            similarity_boost: this.voiceSettings.similarity_boost,
          },
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      // Guardar audio en archivo temporal
      const audioPath = `${FileSystem.cacheDirectory}iri_audio_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(
        audioPath,
        Buffer.from(response.data).toString('base64'),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      return audioPath;
    } catch (error) {
      console.error('Error en ElevenLabs TTS:', error);
      throw new Error('No pude generar la voz. Intenta de nuevo.');
    }
  }

  /**
   * Reproducir audio
   */
  async playAudio(audioPath: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: true }
      );

      await sound.playAsync();

      // Limpiar cuando termine
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
      throw new Error('No pude reproducir el audio.');
    }
  }

  /**
   * Reproducir texto directamente (TTS + Play)
   */
  async speak(
    text: string,
    voiceGender: VoiceGender = 'female',
    speed: number = 1.0
  ): Promise<void> {
    try {
      const audioPath = await this.textToSpeech(text, voiceGender, speed);
      await this.playAudio(audioPath);
    } catch (error) {
      console.error('Error en speak:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de voces disponibles
   */
  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await axios.get(
        `${ELEVENLABS_BASE_URL}/voices`,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      );

      return response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        gender: voice.labels?.gender || 'unknown',
        description: voice.labels?.description || '',
      }));
    } catch (error) {
      console.error('Error obteniendo voces:', error);
      return [];
    }
  }

  /**
   * Actualizar configuración de voz
   */
  updateVoiceSettings(stability: number, similarityBoost: number): void {
    this.voiceSettings = {
      stability: Math.max(0, Math.min(1, stability)),
      similarity_boost: Math.max(0, Math.min(1, similarityBoost)),
    };
  }

  /**
   * Obtener configuración actual
   */
  getVoiceSettings(): VoiceSettings {
    return { ...this.voiceSettings };
  }

  /**
   * Cambiar ID de voz para un género
   */
  setVoiceId(gender: VoiceGender, voiceId: string): void {
    this.voiceMap[gender] = voiceId;
  }

  /**
   * Obtener ID de voz actual
   */
  getVoiceId(gender: VoiceGender): string {
    return this.voiceMap[gender];
  }
}

export default new ElevenLabsService();
