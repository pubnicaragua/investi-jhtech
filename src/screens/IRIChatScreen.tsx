/**
 * IRIChatScreen.tsx
 * Pantalla de chat con Irï (Inteligencia Artificial) usando Grok API
 * 
 * Características:
 * - Chat en tiempo real con IA
 * - Contexto completo de la app Investi
 * - Interfaz moderna con burbujas de chat
 * - Historial de conversación
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  Trash2, 
  Volume2, 
  Mic, 
  MicOff, 
} from 'lucide-react-native';
import Voice from '@react-native-voice/voice';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { getCurrentUserId, saveIRIChatMessage, loadIRIChatHistory, clearIRIChatHistory } from '../rest/api';
import iriVoiceService, { VoiceGender } from '../services/iriVoiceService';
import * as Speech from 'expo-speech';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// IMPORTANTE: La API key debe estar en el archivo .env
// Crear archivo .env en la raíz con: EXPO_PUBLIC_GROK_API_KEY=tu_api_key_aqui
// TEMPORAL: Hardcodeada para testing (REMOVER EN PRODUCCIÓN)

const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY || '';
// Usar la API de Groq correctamente
const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// DEBUG: Verificar si la API key se cargó
console.log(' GROK_API_KEY loaded:', GROK_API_KEY ? `${GROK_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log(' GROK_API_URL:', GROK_API_URL);

const SYSTEM_CONTEXT = `Eres Irï, el asistente de inteligencia artificial de Investi, una aplicación de educación financiera y comunidad para jóvenes en Nicaragua.

CONTEXTO DE LA APP INVESTI:
- Investi es una plataforma que ayuda a jóvenes a aprender sobre finanzas personales, inversiones y emprendimiento
- Ofrece herramientas financieras como: Planificador Financiero, Caza Hormigas (para encontrar gastos innecesarios), Generador de Reportes
- Tiene comunidades donde los usuarios pueden conectar: Comunidades Públicas, Privadas y de Colegio
- Las comunidades de colegio permiten crear metas de ahorro grupales (ej: para giras de estudios)
- Ofrece cursos, videos educativos y noticias sobre finanzas, criptomonedas, inversiones y startups

TU PERSONALIDAD:
- Eres amigable, cercano y juvenil, pero profesional
- Usas un lenguaje simple y claro
- Das ejemplos prácticos y relevantes para jóvenes
- Motivas y educas sobre finanzas de forma positiva
- Puedes usar emojis ocasionalmente para ser más cercano

CÓMO RESPONDES:
- Respuestas concisas (máximo 3-4 párrafos)
- Si la pregunta es sobre finanzas, da consejos educativos generales
- Si preguntan sobre la app, explica las funcionalidades disponibles
- Si no sabes algo, sé honesto y sugiere recursos alternativos

⚠️ IMPORTANTE - DISCLAIMER:
- NO des consejos específicos de inversión
- NO recomiendes acciones, criptomonedas o instrumentos financieros específicos
- Siempre recuerda al usuario que consulte con un asesor financiero profesional para decisiones de inversión
- Tu rol es EDUCATIVO, no de asesoría financiera personalizada`;

export default function IRIChatScreen({ navigation }: any) {
  useAuthGuard();

  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('FEMALE');
  const [lastTap, setLastTap] = useState<number>(0);
  const [currentSound, setCurrentSound] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const waveAnimation = useRef(new Animated.Value(0)).current;
  
  // Animación del fondo
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Configurar Voice Recognition
  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log('🎤 Speech started');
      setIsListening(true);
      startWaveAnimation();
    };

    Voice.onSpeechEnd = () => {
      console.log('🎤 Speech ended');
      setIsListening(false);
      stopWaveAnimation();
    };

    Voice.onSpeechResults = (e: any) => {
      console.log('🎤 Speech results:', e.value);
      if (e.value && e.value[0]) {
        const text = e.value[0];
        setRecognizedText(text);
        setInputText(text);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('🎤 Speech error:', e.error);
      setIsListening(false);
      stopWaveAnimation();
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Auto-saludo al entrar
  useEffect(() => {
    const greetUser = async () => {
      // Esperar 500ms para que cargue el historial
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Si no hay mensajes, dar bienvenida automática
      if (messages.length === 0) {
        handleHolaIri();
      }
    };
    
    greetUser();
  }, []);

  // Cargar historial al montar el componente
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        console.log('No hay usuario logueado');
        // Mostrar mensaje de bienvenida si no hay usuario
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
      
      // Cargar historial desde Supabase
      const history = await loadIRIChatHistory(currentUserId);
      
      if (history && history.length > 0) {
        // Convertir historial de Supabase a formato de mensajes
        const loadedMessages: Message[] = history.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
        console.log(`✅ Cargados ${loadedMessages.length} mensajes del historial`);
      } else {
        // Si no hay historial, mostrar mensaje de bienvenida
        const welcomeMessage: Message = {
          id: '1',
          content: '¡Hola! Soy Irï, tu asistente de educación financiera. ¿En qué puedo ayudarte hoy?',
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        // Guardar mensaje de bienvenida
        await saveIRIChatMessage(currentUserId, 'assistant', welcomeMessage.content);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      // Mostrar mensaje de bienvenida en caso de error
      setMessages([{
        id: '1',
        content: '¡Hola! Soy Irï, tu asistente de educación financiera. ¿En qué puedo ayudarte hoy?',
        role: 'assistant',
        timestamp: new Date(),
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Funciones de Voice
  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnimation.setValue(0);
  };

  const toggleVoiceInput = useCallback(async () => {
    try {
      if (isListening) {
        // Detener escucha
        await Voice.stop();
        setIsListening(false);
        stopWaveAnimation();
      } else {
        // Iniciar escucha
        setRecognizedText('');
        await Voice.start('es-ES'); // Español
        setIsListening(true);
        startWaveAnimation();
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      Alert.alert(
        'Error de Micrófono',
        'No se pudo acceder al micrófono. Verifica los permisos de la aplicación.',
        [{ text: 'OK' }]
      );
      setIsListening(false);
      stopWaveAnimation();
    }
  }, [isListening]);

  const handleHolaIri = async () => {
    // Responder inmediatamente con voz
    const greeting = '¡Hola! Soy Iri, tu asistente financiera. ¿En qué puedo ayudarte?';
    
    // Agregar mensaje de Iri
    const iriMessage: Message = {
      id: Date.now().toString(),
      content: greeting,
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, iriMessage]);
    
    // Hablar inmediatamente
    if (voiceEnabled) {
      try {
        setIsSpeaking(true);
        await iriVoiceService.speak(greeting);
        setIsSpeaking(false);
      } catch (error) {
        console.error('Error speaking:', error);
        setIsSpeaking(false);
      }
    }
    
    // Guardar en historial
    if (userId) {
      await saveIRIChatMessage(userId, 'assistant', greeting);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    if (!GROK_API_KEY) {
      Alert.alert(
        'Configuración requerida',
        'La API key de Grok no está configurada. Por favor, agrega EXPO_PUBLIC_GROK_API_KEY en el archivo .env y reinicia el servidor'
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Guardar mensaje del usuario en Supabase
    if (userId) {
      await saveIRIChatMessage(userId, 'user', userMessage.content);
    }

    try {
      console.log('📤 Enviando mensaje a Groq API...');
      const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_CONTEXT },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: 'user', content: userMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      console.log('📥 Respuesta recibida:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error response:', errorData);
        
        let errorMessage = 'No se pudo enviar el mensaje';
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error?.message) {
            errorMessage = errorJson.error.message;
          }
        } catch {
          // Si no es JSON, usar el texto directamente
          errorMessage = errorData.substring(0, 100);
        }
        
        if (response.status === 401) {
          Alert.alert(
            'API Key Inválida',
            `Error 401: ${errorMessage}\n\nVerifica que la API key esté configurada correctamente en .env`
          );
        } else {
          Alert.alert(
            'Error',
            `Error ${response.status}: ${errorMessage}`
          );
        }
        
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('✅ Datos procesados:', data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Guardar respuesta del asistente en Supabase
      if (userId) {
        await saveIRIChatMessage(userId, 'assistant', assistantMessage.content);
      }

      // Reproducir respuesta con voz
      try {
        setIsSpeaking(true);
        iriVoiceService.setVoicePreferences({ gender: voiceGender });
        await iriVoiceService.speak(assistantMessage.content);
        setIsSpeaking(false);
      } catch (voiceError) {
        console.error('Error reproduciendo voz:', voiceError);
        setIsSpeaking(false);
      }
    } catch (error: any) {
      console.error('❌ Error al enviar mensaje:', error);
      Alert.alert(
        'Error',
        `No se pudo enviar el mensaje: ${error.message}. Verifica que la API key esté configurada correctamente en .env`
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, userId]);

  const handleClearHistory = useCallback(async () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que quieres borrar todo el historial de conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            if (userId) {
              const success = await clearIRIChatHistory(userId);
              if (success) {
                // Recargar historial (mostrará solo mensaje de bienvenida)
                await loadChatHistory();
                Alert.alert('Éxito', 'Historial borrado correctamente');
              } else {
                Alert.alert('Error', 'No se pudo borrar el historial');
              }
            }
          },
        },
      ]
    );
  }, [userId]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('es-NI', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Memoizar mensajes para evitar re-renders innecesarios
  const memoizedMessages = useMemo(() => messages, [messages]);

  return (
    <View style={styles.container}>
      {/* Fondo animado con gradiente */}
      <Animated.View
        style={[
          styles.animatedBackground,
          {
            opacity: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.6, 0.3],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={['#F9A8D4', '#FDF2F8', '#F5F3FF', '#FCE7F3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header blanco con iconos morados */}
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
            <Image 
              source={require('../../assets/iri-icono.jpg')} 
              style={styles.iriGif}
              resizeMode="contain"
            />
          <View>
            <Text style={styles.headerTitle}>Irï</Text>
            <Text style={styles.headerSubtitle}>Asistente IA</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {isSpeaking && (
            <TouchableOpacity 
              onPress={() => {
                console.log('⏹️ Pausando audio...');
                Speech.stop();
                setIsSpeaking(false);
              }} 
              style={styles.stopButton}
            >
              <MicOff size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClearHistory}>
            <Trash2 size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior='padding'
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {loadingHistory ? (
            <View style={styles.historyLoadingContainer}>
              <ActivityIndicator size="large" color="#2673f3" />
              <Text style={styles.historyLoadingText}>Cargando historial...</Text>
            </View>
          ) : (
            memoizedMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
              onPress={async () => {
                // Doble tap para reproducir mensaje en voz
                if (message.role === 'assistant') {
                  const now = Date.now();
                  const DOUBLE_TAP_DELAY = 300; // 300ms para doble tap
                  
                  if (now - lastTap < DOUBLE_TAP_DELAY) {
                    // Es doble tap - reproducir
                    setLastTap(0);
                    try {
                      setIsSpeaking(true);
                      await iriVoiceService.speak(message.content);
                      setIsSpeaking(false);
                    } catch (error) {
                      console.error('Error speaking message:', error);
                      setIsSpeaking(false);
                      // Fallback a expo-speech si ElevenLabs falla
                      await Speech.speak(message.content, {
                        language: 'es-ES',
                        pitch: voiceGender === 'FEMALE' ? 1.2 : 0.8,
                        rate: 1.0,
                      });
                    }
                  } else {
                    // Primer tap - esperar segundo tap
                    setLastTap(now);
                  }
                }
              }}
              activeOpacity={message.role === 'assistant' ? 0.7 : 1}
            >
              {message.role === 'assistant' && (
                <Image 
                  source={require('../../assets/iri-icono-Sin-fondo.gif')} 
                  style={styles.assistantIconImage}
                  resizeMode="contain"
                />
              )}
              <View style={styles.messageContent}>
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user'
                      ? styles.userText
                      : styles.assistantText,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.role === 'user'
                      ? styles.userTime
                      : styles.assistantTime,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
          )}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Image 
                source={require('../../assets/iri-icono-Sin-fondo.gif')} 
                style={styles.assistantIconImage}
                resizeMode="contain"
              />
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2673f3" />
                <Text style={styles.loadingText}>Irï está escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          {/* Animación de onda cuando está escuchando */}
          {isListening && (
            <View style={styles.waveContainer}>
              {[0, 1, 2, 3, 4].map(i => (
                <Animated.View
                  key={i}
                  style={[
                    styles.wave,
                    {
                      transform: [
                        {
                          scaleY: waveAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2 + Math.random()],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
              <Text style={styles.listeningText}>Escuchando... Di "Hola Iri"</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Botón de micrófono */}
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={toggleVoiceInput}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff size={24} color="#FFFFFF" />
              ) : (
                <Mic size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Pregúntale a Iri..."
              placeholderTextColor="#C084FC"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading && !isListening}
            />
            
            {/* Selector de voz (Masculino/Femenino) */}
            <TouchableOpacity
              style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
              onPress={() => {
                const newGender = voiceGender === 'FEMALE' ? 'MALE' : 'FEMALE';
                setVoiceGender(newGender);
              }}
              disabled={isLoading}
            >
              <Volume2 size={20} color={isSpeaking ? '#F9A8D4' : '#C084FC'} />
              <Text style={styles.voiceGenderText}>
                {voiceGender === 'FEMALE' ? '♀' : '♂'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              disabled={!inputText.trim() || isLoading}
            >
              <Send
                size={22}
                color={!inputText.trim() || isLoading ? '#ccc' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
    opacity: 0.15,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  iriGif: {
    width: 48,
    height: 48,
  },
  iriIcon: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  historyLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  historyLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assistantIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  userText: {
    backgroundColor: '#8B5CF6',
    color: '#fff',
    padding: 14,
    borderRadius: 20,
    borderTopRightRadius: 6,
    fontSize: 15,
    lineHeight: 22,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  assistantText: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#1F2937',
    padding: 14,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    fontSize: 15,
    lineHeight: 22,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userTime: {
    color: '#fff',
    opacity: 0.7,
    textAlign: 'right',
  },
  assistantTime: {
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 14,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    gap: 8,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  wave: {
    width: 4,
    height: 20,
    backgroundColor: '#F9A8D4',
    borderRadius: 2,
  },
  listeningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#F9A8D4',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9A8D4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F9A8D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#F9A8D4',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  voiceButtonActive: {
    backgroundColor: '#f3e8ff',
    borderColor: '#8B5CF6',
  },
  voiceGenderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 2,
  },
});
