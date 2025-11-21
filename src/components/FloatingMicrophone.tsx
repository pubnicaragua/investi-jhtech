/**
 * Micrófono Flotante Arrastrable con ElevenLabs
 * Componente reutilizable para las 3 herramientas
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Mic, MicOff, Volume2, X } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { IriAlert } from './IriAlert';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIC_SIZE = 60;

interface FloatingMicrophoneProps {
  onTranscript: (text: string) => void;
  onClose?: () => void;
  toolName: 'cazahormigas' | 'planificador' | 'reportes';
  isVisible?: boolean;
}

export function FloatingMicrophone({
  onTranscript,
  onClose,
  toolName,
  isVisible = true,
}: FloatingMicrophoneProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Posición del micrófono (arrastrable)
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT / 2 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // PanResponder para arrastrar el micrófono
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        
        // Ajustar a los bordes si está muy cerca
        let finalX = (pan.x as any)._value;
        let finalY = (pan.y as any)._value;

        // Límites de la pantalla
        if (finalX < 0) finalX = 10;
        if (finalX > SCREEN_WIDTH - MIC_SIZE) finalX = SCREEN_WIDTH - MIC_SIZE - 10;
        if (finalY < 50) finalY = 50;
        if (finalY > SCREEN_HEIGHT - MIC_SIZE - 50) finalY = SCREEN_HEIGHT - MIC_SIZE - 50;

        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: finalX,
            useNativeDriver: false,
          }),
          Animated.spring(pan.y, {
            toValue: finalY,
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      },
    })
  ).current;

  // Animación de pulso cuando está grabando
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Solicitar permisos de audio
  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  };

  // Iniciar grabación
  const startRecording = async () => {
    try {
      const hasPermission = await requestAudioPermissions();
      if (!hasPermission) {
        alert('Se necesitan permisos de micrófono para usar esta función');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      console.log('🎤 Grabación iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error al iniciar la grabación');
    }
  };

  // Detener grabación y transcribir
  const stopRecording = async () => {
    if (!recording) {
      console.log('⚠️ No hay grabación activa para detener');
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(false);
      
      // Verificar que el recording sigue válido antes de detenerlo
      const status = await recording.getStatusAsync();
      if (!status.isRecording) {
        console.log('⚠️ La grabación ya fue detenida');
        setRecording(null);
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('🎤 Grabación detenida:', uri);

      // Mostrar mensaje de próximamente
      setShowComingSoon(true);

      setRecording(null);
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      setRecording(null);
      setIsRecording(false);
      
      // No mostrar alert si el error es que el recorder no existe
      if (!error.message?.includes('does not exist')) {
        alert('Error al detener la grabación');
      }
    }
  };

  // Alternar grabación
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Hablar respuesta con Text-to-Speech
  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Usar expo-speech (gratis) o ElevenLabs (premium)
      await Speech.speak(text, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  };

  // Detener habla
  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Detener grabación si está activa
      if (recording) {
        recording.getStatusAsync()
          .then(status => {
            if (status.isRecording || status.canRecord) {
              return recording.stopAndUnloadAsync();
            }
          })
          .catch(err => {
            // Ignorar errores de cleanup silenciosamente
            console.log('⚠️ Cleanup: grabación ya liberada');
          });
      }
      // Detener habla si está activa
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, [recording, isSpeaking]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Botón principal del micrófono */}
      <Animated.View
        style={[
          styles.micButton,
          isRecording && styles.micButtonRecording,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.micTouchable}
          onPress={toggleRecording}
          activeOpacity={0.8}
        >
          {isRecording ? (
            <MicOff size={28} color="#fff" />
          ) : (
            <Mic size={28} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Indicador de grabación */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
          </View>
        )}
      </Animated.View>

      {/* Botón de cerrar */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={16} color="#666" />
        </TouchableOpacity>
      )}

      {/* Botón de reproducir (cuando hay respuesta) */}
      {transcript && !isRecording && (
        <TouchableOpacity
          style={styles.speakButton}
          onPress={() => (isSpeaking ? stopSpeaking() : speakResponse(transcript))}
        >
          <Volume2 size={20} color={isSpeaking ? '#2673f3' : '#666'} />
        </TouchableOpacity>
      )}

      {/* Tooltip con el nombre de la herramienta */}
      <View style={styles.tooltip}>
        <Text style={styles.tooltipText}>
          {toolName === 'cazahormigas'
            ? '🐜 CazaHormigas'
            : toolName === 'planificador'
            ? '💰 Planificador'
            : '📊 Reportes'}
        </Text>
      </View>

      {/* Alert de Próximamente */}
      <IriAlert
        visible={showComingSoon}
        title="Irï"
        message="La transcripción de voz estará disponible próximamente. Por ahora, puedes usar los ejemplos del botón de información (ℹ️) para conocer las funcionalidades."
        onClose={() => setShowComingSoon(false)}
        type="info"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: MIC_SIZE,
    height: MIC_SIZE,
    zIndex: 9999,
  },
  micButton: {
    width: MIC_SIZE,
    height: MIC_SIZE,
    borderRadius: MIC_SIZE / 2,
    backgroundColor: '#2673f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: '#FF6B6B',
  },
  micTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF0000',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  speakButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltip: {
    position: 'absolute',
    bottom: -30,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FloatingMicrophone;
