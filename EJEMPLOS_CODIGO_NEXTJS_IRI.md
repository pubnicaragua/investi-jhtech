# 💻 Ejemplos de Código Adaptado para Next.js

## 1. Cliente de Supabase (lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 2. Funciones de API (lib/api/iriChat.ts)

```typescript
import { supabase } from '../supabase';

export async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function saveIRIChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
) {
  try {
    const { data, error } = await supabase
      .from('iri_chat_messages')
      .insert({
        user_id: userId,
        role: role,
        content: content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error guardando mensaje de IRI:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en saveIRIChatMessage:', error);
    return null;
  }
}

export async function loadIRIChatHistory(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('iri_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error cargando historial de IRI:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error en loadIRIChatHistory:', error);
    return [];
  }
}

export async function clearIRIChatHistory(userId: string) {
  try {
    const { error } = await supabase
      .from('iri_chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error limpiando historial de IRI:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en clearIRIChatHistory:', error);
    return false;
  }
}
```

---

## 3. Servicio de Voz Web (lib/services/iriVoiceService.ts)

```typescript
export type VoiceGender = 'MALE' | 'FEMALE';

interface VoicePreferences {
  gender: VoiceGender;
  speed: number;
  pitch: number;
}

class IRIVoiceService {
  private voicePreferences: VoicePreferences = {
    gender: 'FEMALE',
    speed: 1.0,
    pitch: 1.2,
  };

  /**
   * Hablar usando Web Speech API (GRATIS, nativo del navegador)
   */
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.error('Web Speech API no soportada');
        reject(new Error('Web Speech API no disponible'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = this.voicePreferences.speed;
      utterance.pitch = this.voicePreferences.pitch;

      // Seleccionar voz según género
      const voices = window.speechSynthesis.getVoices();
      const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
      
      if (spanishVoices.length > 0) {
        // Buscar voz femenina o masculina
        const preferredVoice = spanishVoices.find(v => 
          this.voicePreferences.gender === 'FEMALE' 
            ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('mujer')
            : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('hombre')
        );
        utterance.voice = preferredVoice || spanishVoices[0];
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Detener reproducción
   */
  stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
   * Alternativa: ElevenLabs (requiere API key)
   */
  async speakWithElevenLabs(text: string): Promise<void> {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const voiceId = this.voicePreferences.gender === 'FEMALE' 
      ? process.env.ELEVENLABS_VOICE_ID_FEMALE 
      : process.env.ELEVENLABS_VOICE_ID_MALE;

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key no configurada');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error en ElevenLabs API');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }
}

export default new IRIVoiceService();
```

---

## 4. Hook useIRIVoice (hooks/useIRIVoice.ts)

```typescript
'use client';

import { useState, useCallback } from 'react';
import iriVoiceService, { VoiceGender } from '@/lib/services/iriVoiceService';
import { saveIRIChatMessage, getCurrentUserId } from '@/lib/api/iriChat';

interface UseIRIVoiceReturn {
  isProcessing: boolean;
  isSpeaking: boolean;
  voiceGender: VoiceGender;
  conversationHistory: Array<{ role: string; content: string }>;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  setVoiceGender: (gender: VoiceGender) => void;
  clearHistory: () => void;
}

export function useIRIVoice(): UseIRIVoiceReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>('FEMALE');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessageToGrok = useCallback(async (message: string): Promise<string> => {
    try {
      const GROK_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY;
      
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
          model: 'llama-3.3-70b-versatile',
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
      const userId = await getCurrentUserId();
      if (userId) {
        await saveIRIChatMessage(userId, 'user', message);
        await saveIRIChatMessage(userId, 'assistant', grokResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en sendMessage:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [sendMessageToGrok]);

  const setVoiceGender = useCallback((gender: VoiceGender) => {
    setVoiceGenderState(gender);
    iriVoiceService.setVoicePreferences({ gender });
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    isProcessing,
    isSpeaking,
    voiceGender,
    conversationHistory,
    error,
    sendMessage,
    setVoiceGender,
    clearHistory,
  };
}
```

---

## 5. Componente de Chat (app/chat-iri/page.tsx)

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Trash2, Volume2, Mic, MicOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useIRIVoice } from '@/hooks/useIRIVoice';
import { getCurrentUserId, loadIRIChatHistory, clearIRIChatHistory } from '@/lib/api/iriChat';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatIRIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isProcessing,
    isSpeaking,
    voiceGender,
    sendMessage: sendVoiceMessage,
    setVoiceGender,
  } = useIRIVoice();

  // Cargar historial al montar
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll al final
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        setMessages([{
          id: '1',
          content: '¡Hola! Soy Irï, tu asistente de educación financiera. ¿En qué puedo ayudarte hoy?',
          role: 'assistant',
          timestamp: new Date(),
        }]);
        setLoadingHistory(false);
        return;
      }

      setUserId(currentUserId);
      const history = await loadIRIChatHistory(currentUserId);
      
      if (history && history.length > 0) {
        const loadedMessages: Message[] = history.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      } else {
        const welcomeMessage: Message = {
          id: '1',
          content: '¡Hola! Soy Irï, tu asistente de educación financiera. ¿En qué puedo ayudarte hoy?',
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Enviar a Grok y obtener respuesta con voz
    await sendVoiceMessage(userMessage.content);

    // Agregar respuesta a mensajes (esto se hace en el hook)
  };

  const handleClearHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar todo el historial?')) return;
    
    if (userId) {
      const success = await clearIRIChatHistory(userId);
      if (success) {
        await loadChatHistory();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft size={24} className="text-purple-600" />
        </button>
        
        <div className="flex items-center gap-3">
          <Image 
            src="/images/iri-icono.jpg" 
            alt="IRI"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold text-purple-600">Irï</h1>
            <p className="text-sm text-purple-400">Asistente IA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSpeaking && (
            <button className="p-2">
              <MicOff size={20} className="text-red-500" />
            </button>
          )}
          <button onClick={handleClearHistory} className="p-2">
            <Trash2 size={20} className="text-purple-600" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Cargando historial...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'assistant' && (
                  <Image 
                    src="/images/iri-icono-animated.gif" 
                    alt="IRI"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm shadow-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-right text-gray-500' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-NI', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-md">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600 italic">Irï está escribiendo...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white shadow-lg px-4 py-3">
        <div className="flex items-end gap-2">
          <button className="p-3 bg-pink-300 rounded-full">
            <Mic size={24} className="text-white" />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Pregúntale a Iri..."
            className="flex-1 px-4 py-3 border-2 border-pink-300 rounded-3xl resize-none focus:outline-none focus:border-purple-400"
            rows={1}
            maxLength={500}
            disabled={isProcessing}
          />

          <button
            onClick={() => {
              const newGender = voiceGender === 'FEMALE' ? 'MALE' : 'FEMALE';
              setVoiceGender(newGender);
            }}
            className="p-3 bg-gray-100 rounded-full"
          >
            <Volume2 size={20} className="text-purple-400" />
            <span className="text-xs">{voiceGender === 'FEMALE' ? '♀' : '♂'}</span>
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="p-3 bg-purple-500 rounded-full disabled:bg-gray-300"
          >
            <Send size={22} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Metadata para SEO (app/chat-iri/layout.tsx)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat con IRI - Asistente Financiero IA | Investi',
  description: 'Habla con IRI, tu asistente de inteligencia artificial para educación financiera. Aprende sobre inversiones, ahorro y finanzas personales de forma gratuita.',
  keywords: 'chat IA, asistente financiero, educación financiera, IRI, Investi, Nicaragua, inversiones, ahorro',
  openGraph: {
    title: 'Chat con IRI - Asistente Financiero IA',
    description: 'Aprende sobre finanzas con IRI, tu asistente personal impulsado por IA',
    images: ['/images/iri-icono.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat con IRI - Asistente Financiero IA',
    description: 'Aprende sobre finanzas con IRI',
    images: ['/images/iri-icono.jpg'],
  },
};

export default function ChatIRILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

---

## 7. Configuración de Tailwind (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'iri-purple': '#8B5CF6',
        'iri-pink': '#F9A8D4',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 8. Tracking de Google Analytics (lib/analytics.ts)

```typescript
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Evento de inicio de chat
export const trackChatStarted = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'chat_started', {
      event_category: 'engagement',
      event_label: 'IRI Chat',
    });
  }
};

// Evento de mensaje enviado
export const trackMessageSent = (messageLength: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'message_sent', {
      event_category: 'engagement',
      event_label: 'IRI Chat',
      value: messageLength,
    });
  }
};

// Evento de conversión (usuario activo)
export const trackConversion = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
    });
  }
};
```

---

**¡Listo! Estos son todos los archivos adaptados para Next.js. 🚀**
