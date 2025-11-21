/**
 * Servicio Global de "Hola Iri"
 * Detecta cuando el usuario dice "Hola Iri" y abre automáticamente el chat
 */

import * as Speech from 'expo-speech';

class HolaIriService {
  private isListening: boolean = false;
  private navigationRef: any = null;
  private recognitionInterval: any = null;

  /**
   * Inicializar el servicio con la referencia de navegación
   */
  initialize(navigationRef: any) {
    this.navigationRef = navigationRef;
    console.log('🎤 HolaIriService initialized');
  }

  /**
   * Iniciar escucha continua de "Hola Iri"
   * NOTA: En Expo Go, el reconocimiento de voz continuo no está disponible
   * Esta es una implementación simulada que se activará con un botón
   */
  startListening() {
    if (this.isListening) return;
    
    this.isListening = true;
    console.log('🎤 Listening for "Hola Iri"...');
    
    // En producción, aquí iría el código de reconocimiento de voz real
    // Por ahora, solo marcamos que está escuchando
  }

  /**
   * Detener escucha
   */
  stopListening() {
    this.isListening = false;
    if (this.recognitionInterval) {
      clearInterval(this.recognitionInterval);
      this.recognitionInterval = null;
    }
    console.log('🎤 Stopped listening');
  }

  /**
   * Simular detección de "Hola Iri"
   * Esta función se llamará cuando el usuario presione el botón de micrófono
   */
  async triggerHolaIri() {
    console.log('✅ "Hola Iri" detected!');
    
    // Responder con voz
    await Speech.speak('¡Hola! ¿En qué puedo ayudarte?', {
      language: 'es-ES',
      pitch: 1.0,
      rate: 1.0,
    });

    // Navegar al chat de Iri
    if (this.navigationRef) {
      this.navigationRef.navigate('Iri');
    }
  }

  /**
   * Verificar si está escuchando
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

export default new HolaIriService();
