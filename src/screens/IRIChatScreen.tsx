/**
 * IRIChatScreen.tsx
 * Pantalla de chat con IRI (Inteligencia Artificial) usando Grok API
 * 
 * Características:
 * - Chat en tiempo real con IA
 * - Contexto completo de la app Investi
 * - Interfaz moderna con burbujas de chat
 * - Historial de conversación
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useAuthGuard } from '../hooks/useAuthGuard';

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
const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// DEBUG: Verificar si la API key se cargó
console.log('🔑 GROK_API_KEY loaded:', GROK_API_KEY ? `${GROK_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

const SYSTEM_CONTEXT = `Eres IRÏ, el asistente de inteligencia artificial de Investi, una aplicación de educación financiera y comunidad para jóvenes en Nicaragua.

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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy IRÏ, tu asistente de inteligencia artificial en Investi. 🌟\n\n¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre educación financiera, ahorro, presupuesto, o explicarte cómo usar las herramientas de Investi.\n\n⚠️ Nota: No proporciono consejos específicos de inversión. Para decisiones de inversión, consulta con un asesor financiero profesional.',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
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

    try {
      const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar el mensaje. Verifica tu conexión a internet y la configuración de la API.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-NI', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image 
            source={require('../../assets/iri-icono-Sin-fondo.gif')} 
            style={styles.iriIcon}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>IRÏ</Text>
            <Text style={styles.headerSubtitle}>Asistente IA</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
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
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Image 
                source={require('../../assets/iri-icono-Sin-fondo.gif')} 
                style={styles.assistantIconImage}
                resizeMode="contain"
              />
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2673f3" />
                <Text style={styles.loadingText}>IRÏ está escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || isLoading}
          >
            <Send
              size={20}
              color={!inputText.trim() || isLoading ? '#ccc' : '#fff'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iriIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iriIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    width: 40,
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
    backgroundColor: '#2673f3',
    color: '#fff',
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    fontSize: 15,
    lineHeight: 20,
  },
  assistantText: {
    backgroundColor: '#fff',
    color: '#111',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    fontSize: 15,
    lineHeight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#111',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2673f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});
