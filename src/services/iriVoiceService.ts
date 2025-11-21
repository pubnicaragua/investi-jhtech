import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import Constants from 'expo-constants';

const ELEVENLABS_API_KEY = Constants.expoConfig?.extra?.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export type VoiceGender = 'MALE' | 'FEMALE';

interface VoicePreferences {
  gender: VoiceGender;
  speed: number; // 0.5 a 2.0
  stability: number; // 0 a 1
  similarityBoost: number; // 0 a 1
}

class IRIVoiceService {
  private voicePreferences: VoicePreferences = {
    gender: 'FEMALE',
    speed: 1.0,
    stability: 0.75,
    similarityBoost: 0.75,
  };

  private voiceMap: Record<VoiceGender, string> = {
    FEMALE: process.env.ELEVENLABS_VOICE_ID_FEMALE || '21m00Tcm4TlvDq8ikWAM',
    MALE: process.env.ELEVENLABS_VOICE_ID_MALE || 'EXAVITQu4vr4xnSDxMaL',
  };

  /**
   * Convertir texto a voz usando ElevenLabs
   */
  async textToSpeech(text: string): Promise<string> {
    try {
      const voiceId = this.voiceMap[this.voicePreferences.gender];

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: this.voicePreferences.stability,
            similarity_boost: this.voicePreferences.similarityBoost,
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
      const audioPath = `${FileSystem.cacheDirectory}iri_${Date.now()}.mp3`;
      const base64Audio = Buffer.from(response.data).toString('base64');

      await FileSystem.writeAsStringAsync(audioPath, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return audioPath;
    } catch (error) {
      console.error('Error en ElevenLabs TTS:', error);
      throw new Error('No pude generar la voz.');
    }
  }

  /**
   * Reproducir audio
   */
  async playAudio(audioPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioPath },
          { shouldPlay: true }
        );

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            resolve();
          }
        });
      } catch (error) {
        console.error('Error reproduciendo audio:', error);
        reject(error);
      }
    });
  }

  /**
   * Hablar (TTS + Play)
   */
  async speak(text: string): Promise<void> {
    const audioPath = await this.textToSpeech(text);
    await this.playAudio(audioPath);
  }

  /**
   * Cambiar preferencias de voz
   */
  setVoicePreferences(preferences: Partial<VoicePreferences>): void {
    this.voicePreferences = {
      ...this.voicePreferences,
      ...preferences,
    };
  }

  /**
   * Obtener preferencias actuales
   */
  getVoicePreferences(): VoicePreferences {
    return { ...this.voicePreferences };
  }

  /**
   * Detectar wake word "Hola IRI"
   */
  static isWakeWord(text: string): boolean {
    const wakeWords = ['hola iri', 'hey iri', 'oye iri', 'iri'];
    return wakeWords.some(word => text.toLowerCase().includes(word));
  }

  /**
   * Extraer comando después de wake word
   */
  static extractCommand(text: string): string {
    const wakeWords = ['hola iri', 'hey iri', 'oye iri'];
    let command = text.toLowerCase().trim();

    for (const word of wakeWords) {
      if (command.includes(word)) {
        command = command.replace(word, '').trim();
        break;
      }
    }

    return command || text;
  }
}

export default new IRIVoiceService();
