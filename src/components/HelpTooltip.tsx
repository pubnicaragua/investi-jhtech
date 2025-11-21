import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { HelpCircle, X } from 'lucide-react-native';

interface HelpTooltipProps {
  title: string;
  description: string;
  position?: 'top-right' | 'top-left';
}

export function HelpTooltip({ title, description, position = 'top-right' }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPressIn={() => setVisible(true)}
        onPressOut={() => setVisible(false)}
        style={[styles.helpButton, position === 'top-left' && styles.helpButtonLeft]}
        activeOpacity={0.7}
      >
        <HelpCircle size={24} color="#2673f3" />
      </TouchableOpacity>

      {visible && (
        <Modal transparent visible={visible} animationType="fade">
          <Pressable 
            style={styles.overlay} 
            onPress={() => setVisible(false)}
          >
            <View style={styles.tooltipContainer}>
              <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.tooltipText}>{description}</Text>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  helpButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpButtonLeft: {
    right: 'auto',
    left: 20,
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
    padding: 20,
    maxWidth: '90%',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  tooltipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
});
