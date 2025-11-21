import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private conversationHistory: ConversationMessage[] = [];
  private systemPrompt = `Eres IRI, una inteligencia artificial financiera de clase mundial creada por Investí. 
Tu objetivo es ayudar a los usuarios con educación financiera, inversiones y análisis de mercado.
Eres profesional, amable, y siempre proporcionas información precisa y útil.
Responde de forma concisa pero completa. Si no sabes algo, lo dices claramente.
Tus respuestas deben ser en el idioma del usuario.`;

  /**
   * Enviar mensaje a GPT-4 y obtener respuesta
   */
  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Agregar mensaje del usuario al historial
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Llamar a OpenAI API
      const response = await axios.post(
        `${OPENAI_BASE_URL}/chat/completions`,
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: this.systemPrompt,
            },
            ...this.conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      // Agregar respuesta al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      console.error('Error en OpenAI:', error);
      throw new Error('No pude procesar tu mensaje. Intenta de nuevo.');
    }
  }

  /**
   * Transcribir audio a texto usando Whisper
   */
  async transcribeAudio(audioPath: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioPath,
        type: 'audio/wav',
        name: 'audio.wav',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      const response = await axios.post(
        `${OPENAI_BASE_URL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.text;
    } catch (error) {
      console.error('Error transcribiendo audio:', error);
      throw new Error('No pude transcribir el audio. Intenta de nuevo.');
    }
  }

  /**
   * Limpiar historial de conversación
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Obtener historial actual
   */
  getHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  /**
   * Establecer historial (para cargar conversaciones previas)
   */
  setHistory(history: ConversationMessage[]): void {
    this.conversationHistory = history;
  }

  /**
   * Detectar si el mensaje contiene "Hola IRI" o variantes
   */
  static isWakeWord(text: string): boolean {
    const wakeWords = [
      'hola iri',
      'hey iri',
      'oye iri',
      'iri',
      'hola inteligencia',
      'hey inteligencia',
    ];

    const lowerText = text.toLowerCase().trim();
    return wakeWords.some(word => lowerText.includes(word));
  }

  /**
   * Extraer comando después de wake word
   */
  static extractCommand(text: string): string {
    const wakeWords = [
      'hola iri',
      'hey iri',
      'oye iri',
      'hola inteligencia',
      'hey inteligencia',
    ];

    let command = text.toLowerCase().trim();

    for (const word of wakeWords) {
      if (command.includes(word)) {
        command = command.replace(word, '').trim();
        break;
      }
    }

    return command;
  }
}

export default new OpenAIService();
