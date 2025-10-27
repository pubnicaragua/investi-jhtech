# Implementación: Lecciones Generadas con Irï

## Visión General

Sistema para que Irï (IA) genere lecciones personalizadas de educación financiera basadas en:
- Perfil del usuario (nivel de conocimiento, intereses)
- Temas solicitados por el usuario
- Progreso de aprendizaje

## Flujo de Usuario Propuesto

### Opción A: Desde el Chat con Irï

```
Usuario: "Irï, crea una lección sobre inversión en bolsa"
Irï: "¡Claro! Voy a crear una lección personalizada sobre inversión en bolsa para ti..."
[Genera lección]
Irï: "✅ Lección creada: 'Introducción a la Inversión en Bolsa'"
[Botón: Ver Lección]
```

### Opción B: Desde Pantalla de Lecciones

```
[Botón: "Generar Lección con Irï"]
→ Modal: "¿Sobre qué tema quieres aprender?"
→ Usuario escribe tema
→ Irï genera lección
→ Navega a LessonDetailScreen
```

## Arquitectura Propuesta

### 1. Base de Datos (Supabase)

```sql
-- Tabla para lecciones generadas por IA
CREATE TABLE ai_generated_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Estructura de la lección
  topic TEXT NOT NULL,
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  estimated_duration INTEGER, -- minutos
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  progress INTEGER DEFAULT 0, -- 0-100
  ai_model TEXT DEFAULT 'grok', -- modelo usado
  generation_prompt TEXT, -- prompt usado
  user_rating INTEGER, -- 1-5 estrellas
  bookmarked BOOLEAN DEFAULT FALSE
);

-- Índices
CREATE INDEX idx_ai_lessons_user ON ai_generated_lessons(user_id);
CREATE INDEX idx_ai_lessons_topic ON ai_generated_lessons(topic);
CREATE INDEX idx_ai_lessons_created ON ai_generated_lessons(created_at DESC);
```

### 2. Estructura de Contenido de Lección

```typescript
interface LessonContent {
  sections: LessonSection[];
  quiz?: QuizQuestion[];
  resources?: Resource[];
}

interface LessonSection {
  id: string;
  title: string;
  content: string; // Markdown o HTML
  type: 'text' | 'video' | 'interactive' | 'example';
  order: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'tool';
}
```

### 3. Prompt para Grok/Groq

```typescript
const LESSON_GENERATION_PROMPT = `
Eres Irï, un experto en educación financiera. Genera una lección estructurada sobre el tema: {TOPIC}

Nivel del usuario: {USER_LEVEL}
Intereses: {USER_INTERESTS}

La lección debe incluir:
1. Título atractivo y descriptivo
2. Descripción breve (2-3 líneas)
3. 3-5 secciones con contenido educativo
4. Ejemplos prácticos aplicables a Nicaragua
5. 3-5 preguntas de quiz para evaluar comprensión
6. Recursos adicionales (opcional)

Formato de respuesta en JSON:
{
  "title": "Título de la lección",
  "description": "Descripción breve",
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_duration": 15,
  "sections": [
    {
      "title": "Sección 1",
      "content": "Contenido en markdown...",
      "type": "text",
      "order": 1
    }
  ],
  "quiz": [
    {
      "question": "¿Pregunta?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explicación..."
    }
  ],
  "resources": [
    {
      "title": "Recurso adicional",
      "url": "https://...",
      "type": "article"
    }
  ]
}

IMPORTANTE: 
- Usa lenguaje claro y accesible
- Incluye ejemplos con córdobas (C$)
- Menciona instituciones nicaragüenses cuando sea relevante
- Sé conciso pero completo
`;
```

## Implementación de Código

### 1. Función para Generar Lección

```typescript
// src/rest/api.ts

export async function generateLessonWithAI(
  userId: string,
  topic: string,
  userLevel: string = 'beginner'
): Promise<any> {
  try {
    // 1. Obtener perfil del usuario
    const user = await getCurrentUser();
    const interests = user?.intereses?.join(', ') || 'finanzas generales';

    // 2. Construir prompt
    const prompt = LESSON_GENERATION_PROMPT
      .replace('{TOPIC}', topic)
      .replace('{USER_LEVEL}', userLevel)
      .replace('{USER_INTERESTS}', interests);

    // 3. Llamar a Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Genera una lección sobre: ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const lessonContent = JSON.parse(data.choices[0].message.content);

    // 4. Guardar en Supabase
    const { data: lesson, error } = await supabase
      .from('ai_generated_lessons')
      .insert({
        user_id: userId,
        title: lessonContent.title,
        description: lessonContent.description,
        content: lessonContent,
        topic: topic,
        difficulty_level: lessonContent.difficulty_level,
        estimated_duration: lessonContent.estimated_duration,
        generation_prompt: prompt,
      })
      .select()
      .single();

    if (error) throw error;

    return lesson;
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
}

// Obtener lecciones del usuario
export async function getUserAILessons(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('ai_generated_lessons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Actualizar progreso de lección
export async function updateLessonProgress(
  lessonId: string,
  progress: number
): Promise<void> {
  const updates: any = { progress };
  
  if (progress >= 100) {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('ai_generated_lessons')
    .update(updates)
    .eq('id', lessonId);

  if (error) throw error;
}
```

### 2. Componente de Generación de Lección

```typescript
// src/components/GenerateLessonModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Sparkles } from 'lucide-react-native';
import { generateLessonWithAI } from '../rest/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLessonGenerated: (lesson: any) => void;
  userId: string;
}

export function GenerateLessonModal({ visible, onClose, onLessonGenerated, userId }: Props) {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Por favor escribe un tema para la lección');
      return;
    }

    setGenerating(true);
    try {
      const lesson = await generateLessonWithAI(userId, topic);
      onLessonGenerated(lesson);
      setTopic('');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo generar la lección');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={24} color="#2673f3" />
              <Text style={styles.title}>Generar Lección con Irï</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Irï creará una lección personalizada sobre el tema que elijas
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej: Inversión en bolsa, ahorro, criptomonedas..."
            value={topic}
            onChangeText={setTopic}
            editable={!generating}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, generating && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Sparkles size={20} color="#fff" />
                <Text style={styles.buttonText}>Generar Lección</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2673f3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 3. Integración en IRIChatScreen

```typescript
// Agregar en IRIChatScreen.tsx

// Detectar cuando el usuario pide generar una lección
const detectLessonRequest = (message: string): string | null => {
  const patterns = [
    /crea.*lección.*sobre\s+(.+)/i,
    /genera.*lección.*sobre\s+(.+)/i,
    /quiero.*aprender.*sobre\s+(.+)/i,
    /enseñame.*sobre\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

// En la función sendMessage, después de recibir respuesta de Irï:
const topic = detectLessonRequest(inputText);
if (topic) {
  // Generar lección automáticamente
  try {
    const lesson = await generateLessonWithAI(currentUserId, topic);
    
    // Agregar mensaje de Irï con botón para ver lección
    const iriResponse: ChatMessage = {
      id: Date.now().toString(),
      text: `✅ ¡Lección creada! He preparado una lección personalizada sobre "${lesson.title}". ¿Quieres verla ahora?`,
      isUser: false,
      timestamp: new Date(),
      lessonId: lesson.id, // Nuevo campo
    };
    
    setMessages(prev => [...prev, iriResponse]);
  } catch (error) {
    console.error('Error generating lesson:', error);
  }
}
```

## Checklist de Implementación

- [ ] Crear tabla `ai_generated_lessons` en Supabase
- [ ] Implementar función `generateLessonWithAI` en `api.ts`
- [ ] Crear componente `GenerateLessonModal`
- [ ] Integrar detección de lecciones en `IRIChatScreen`
- [ ] Actualizar `LessonDetailScreen` para mostrar lecciones AI
- [ ] Agregar pantalla de lista de lecciones generadas
- [ ] Implementar sistema de progreso y completado
- [ ] Agregar rating de lecciones
- [ ] Testing completo del flujo

## Próximos Pasos

1. **Confirmar el flujo deseado** con el usuario
2. **Crear la tabla en Supabase**
3. **Implementar la generación básica**
4. **Probar con casos reales**
5. **Iterar basado en feedback**

## Estimación de Tiempo

- Configuración DB: 30 min
- Implementación API: 2 horas
- UI/UX: 3 horas
- Testing: 1 hora
- **Total: ~6-7 horas**
