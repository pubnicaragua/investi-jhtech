import React from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  ScrollView,   
  TouchableOpacity,   
  SafeAreaView   
} from 'react-native'  
import { ArrowLeft, Play, Clock, Users, Star } from 'lucide-react-native'  
  
export function CourseDetailScreen({ navigation, route }: any) {  
  const courseId = route?.params?.courseId || '1'  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Detalle del Curso</Text>  
        <View style={styles.headerRight} />  
      </View>  
  
      <ScrollView style={styles.scrollView}>  
        <View style={styles.courseHeader}>  
          <Text style={styles.courseTitle}>Inversión para Principiantes</Text>  
          <Text style={styles.courseSubtitle}>Curso ID: {courseId}</Text>  
            
          <View style={styles.courseStats}>  
            <View style={styles.statItem}>  
              <Clock size={16} color="#666" />  
              <Text style={styles.statText}>4 horas</Text>  
            </View>  
            <View style={styles.statItem}>  
              <Users size={16} color="#666" />  
              <Text style={styles.statText}>1,234 estudiantes</Text>  
            </View>  
            <View style={styles.statItem}>  
              <Star size={16} color="#FFD700" />  
              <Text style={styles.statText}>4.8</Text>  
            </View>  
          </View>  
        </View>  
  
        <View style={styles.content}>  
          <Text style={styles.sectionTitle}>Descripción</Text>  
          <Text style={styles.description}>  
            Aprende los conceptos fundamentales de inversión, desde los principios básicos   
            hasta estrategias avanzadas para hacer crecer tu patrimonio.  
          </Text>  
  
          <Text style={styles.sectionTitle}>Contenido del Curso</Text>  
          <View style={styles.lessonsList}>  
            {[  
              'Introducción a las inversiones',  
              'Tipos de activos financieros',  
              'Análisis de riesgo y retorno',  
              'Diversificación de portafolio',  
              'Estrategias de inversión a largo plazo'  
            ].map((lesson, index) => (  
              <TouchableOpacity key={index} style={styles.lessonItem}>  
                <Play size={16} color="#007AFF" />  
                <Text style={styles.lessonText}>{lesson}</Text>  
              </TouchableOpacity>  ))}  
          </View>  
  
          <TouchableOpacity style={styles.enrollButton}>  
            <Text style={styles.enrollButtonText}>Inscribirse al Curso</Text>  
          </TouchableOpacity>  
        </View>  
      </ScrollView>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#fff',  
  },  
  header: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'space-between',  
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  backButton: {  
    padding: 5,  
  },  
  headerTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
  },  
  headerRight: {  
    width: 34,  
  },  
  scrollView: {  
    flex: 1,  
  },  
  courseHeader: {  
    padding: 20,  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  courseTitle: {  
    fontSize: 24,  
    fontWeight: 'bold',  
    color: '#111',  
    marginBottom: 5,  
  },  
  courseSubtitle: {  
    fontSize: 14,  
    color: '#666',  
    marginBottom: 15,  
  },  
  courseStats: {  
    flexDirection: 'row',  
    gap: 20,  
  },  
  statItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    gap: 5,  
  },  
  statText: {  
    fontSize: 14,  
    color: '#666',  
  },  
  content: {  
    padding: 20,  
  },  
  sectionTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
    marginBottom: 10,  
    marginTop: 20,  
  },  
  description: {  
    fontSize: 16,  
    color: '#666',  
    lineHeight: 24,  
  },  
  lessonsList: {  
    marginTop: 10,  
  },  
  lessonItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    padding: 15,  
    backgroundColor: '#f8f9fa',  
    borderRadius: 8,  
    marginBottom: 8,  
    gap: 10,  
  },  
  lessonText: {  
    fontSize: 16,  
    color: '#111',  
    flex: 1,  
  },  
  enrollButton: {  
    backgroundColor: '#007AFF',  
    paddingVertical: 16,  
    borderRadius: 12,  
    alignItems: 'center',  
    marginTop: 30,  
  },  
  enrollButtonText: {  
    color: 'white',  
    fontSize: 16,  
    fontWeight: '600',  
  },  
})  
  
export default CourseDetailScreen