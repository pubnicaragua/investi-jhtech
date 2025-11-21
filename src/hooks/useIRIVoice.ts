import { useState, useCallback } from 'react';
import iriVoiceService, { VoiceGender } from '../services/iriVoiceService';
import { supabase } from '../supabase';

interface UseIRIVoiceReturn {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  voiceGender: VoiceGender;
  conversationHistory: Array<{ role: string; content: string }>;
  error: string | null;
  
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setVoiceGender: (gender: VoiceGender) => void;
  clearHistory: () => void;
  saveConversation: (message: string, response: string) => Promise<void>;
}

export function useIRIVoice(): UseIRIVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>('FEMALE');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Enviar mensaje a Grok y obtener respuesta
   */
  const sendMessageToGrok = useCallback(async (message: string): Promise<string> => {
    try {
      const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;
      
      if (!GROK_API_KEY) {
        throw new Error('GROK_API_KEY no configurada');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `Eres Irï, asistente de IA de Investí. Eres amigable, profesional y educativo sobre finanzas. 
Responde en español, de forma concisa (máximo 3 párrafos). 
NO des consejos específicos de inversión, siempre recomienda consultar con un asesor profesional.`,
            },
            ...conversationHistory,
            { role: 'user', content: message },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.error('Error con Grok:', err);
      return 'Disculpa, no pude procesar tu mensaje en este momento. Intenta de nuevo.';
    }
  }, [conversationHistory]);

  /**
   * Enviar mensaje y obtener respuesta de voz
   */
  const sendMessage = useCallback(async (message: string) => {
    try {
      setError(null);
      setIsProcessing(true);

      // Agregar mensaje del usuario al historial
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
      ]);

      // Obtener respuesta de Grok
      const grokResponse = await sendMessageToGrok(message);

      // Agregar respuesta al historial
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: grokResponse },
      ]);

      // Reproducir respuesta con voz
      setIsSpeaking(true);
      await iriVoiceService.speak(grokResponse);
      setIsSpeaking(false);

      // Guardar en base de datos
      await saveConversation(message, grokResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en sendMessage:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [sendMessageToGrok]);

  /**
   * Cambiar género de voz
   */
  const setVoiceGender = useCallback((gender: VoiceGender) => {
    setVoiceGenderState(gender);
    iriVoiceService.setVoicePreferences({ gender });
  }, []);

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  /**
   * Guardar conversación en base de datos
   */
  const saveConversation = useCallback(async (message: string, response: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('iri_conversations').insert({
        user_id: user.id,
        message,
        response,
        voice_preference: voiceGender,
      });
    } catch (err) {
      console.error('Error guardando conversación:', err);
    }
  }, [voiceGender]);

  /**
   * Iniciar escucha (placeholder - requiere expo-speech)
   */
  const startListening = useCallback(async () => {
    setIsListening(true);
    // Aquí iría la integración con expo-speech para reconocimiento de voz
  }, []);

  /**
   * Detener escucha
   */
  const stopListening = useCallback(async () => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    voiceGender,
    conversationHistory,
    error,
    startListening,
    stopListening,
    sendMessage,
    setVoiceGender,
    clearHistory,
    saveConversation,
  };
}
