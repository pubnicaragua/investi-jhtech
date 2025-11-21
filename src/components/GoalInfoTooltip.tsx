import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface GoalInfoTooltipProps {
  goalName: string;
  description: string;
}

// Mapa de descripciones por nombre de meta
const GOAL_DESCRIPTIONS: Record<string, string> = {
  'Auto': 'Convierte cada ahorro en un paso más cerca de las llaves de tu auto soñado. 🚗',
  'Comprar un auto': 'Convierte cada ahorro en un paso más cerca de las llaves de tu auto soñado. 🚗',
  'Casa': 'Tu hogar propio no es un sueño lejano, es una meta alcanzable con disciplina e inversión inteligente. 🏠',
  'Comprar una casa o departamento': 'Tu hogar propio no es un sueño lejano, es una meta alcanzable con disciplina e inversión inteligente. 🏠',
  'Viajar': 'El mundo está esperando por ti. Invierte hoy para explorar mañana sin límites. ✈️',
  'Viajar por el mundo': 'El mundo está esperando por ti. Invierte hoy para explorar mañana sin límites. ✈️',
  'Mascota': 'Asegura el bienestar de tu compañero fiel: su salud y felicidad también son una inversión. 🐶',
  'Bienestar de mi mascota': 'Asegura el bienestar de tu compañero fiel: su salud y felicidad también son una inversión. 🐶',
  'Educación': 'Invierte en conocimiento: el único activo que nadie puede quitarte y que siempre genera retornos. 🎓',
  'Pagar estudios': 'Invierte en conocimiento: el único activo que nadie puede quitarte y que siempre genera retornos. 🎓',
  'Aprender financieramente': 'Aprende y edúcate junto a [IRI_LINK] y toma el control de tus decisiones financieras. 🎓',
  'Emprender': 'Tu idea de negocio merece capital: ahorra e invierte para convertir tu visión en realidad. 🚀',
  'Fondo de emergencia': 'La tranquilidad tiene precio: construye tu colchón financiero para enfrentar cualquier imprevisto. 💼',
  'Lograr libertad financiera': 'Aprende junto a [IRI_LINK] e invierte para lograr la libertad financiera que siempre soñaste. 💰',
  'Hacer crecer mi dinero a largo plazo': 'El tiempo es tu mejor aliado: invierte con visión y observa cómo tu patrimonio se multiplica. 📈',
  'Prepararme para mi salud': 'Tu salud es tu mayor tesoro: invierte en tu bienestar presente y futuro. 🏥',
  'Proyectos personales': 'Tus sueños personales merecen financiamiento: ahorra para hacerlos realidad. ⭐',
};

export function GoalInfoTooltip({ goalName, description }: GoalInfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation<any>();
  const finalDescription = description || GOAL_DESCRIPTIONS[goalName] || '';

  console.log('🎯 GoalInfoTooltip:', goalName, 'hasDescription:', !!finalDescription);

  if (!finalDescription) {
    console.warn('⚠️ No description for goal:', goalName);
    return null;
  }

  // Función para navegar a Iri
  const handleIriClick = () => {
    setVisible(false);
    // Navegar al chat de Iri
    navigation.navigate('IRIChatScreen');
  };

  // Renderizar texto con link a Iri
  const renderDescriptionWithLink = () => {
    if (!finalDescription.includes('[IRI_LINK]')) {
      return <Text style={styles.tooltipText}>{finalDescription}</Text>;
    }

    const parts = finalDescription.split('[IRI_LINK]');
    return (
      <Text style={styles.tooltipText}>
        {parts[0]}
        <Text 
          style={styles.iriLink}
          onPress={handleIriClick}
        >
          Iri
        </Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={(e) => {
          e?.stopPropagation?.();
          setVisible(true);
        }}
        style={styles.infoButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <HelpCircle size={18} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipTitle}>{goalName}</Text>
            {renderDescriptionWithLink()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxWidth: '90%',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  tooltipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iriLink: {
    color: '#007AFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
