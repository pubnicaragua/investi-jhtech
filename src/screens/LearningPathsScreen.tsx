import React from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  FlatList,   
  TouchableOpacity,   
  SafeAreaView   
} from 'react-native'  
import { ArrowLeft, BookOpen, Clock, Trophy } from 'lucide-react-native'  
  
const learningPaths = [  
  {   
    id: '1',   
    title: 'Inversión para Principiantes',   
    description: 'Aprende los conceptos básicos de inversión',  
    duration: '6 semanas',  
    courses: 8,  
    level: 'Principiante'  
  },  
  {   
    id: '2',   
    title: 'Mercado de Valores',   
    description: 'Todo sobre acciones y bonos',  
    duration: '4 semanas',  
    courses: 6,  
    level: 'Intermedio'  
  },  
  {   
    id: '3',   
    title: 'Bienes Raíces',   
    description: 'Inversión en propiedades',  
    duration: '8 semanas',  
    courses: 10,  
    level: 'Avanzado'  
  },  
  {   
    id: '4',   
    title: 'Criptomonedas',   
    description: 'Introducción al mundo cripto',  
    duration: '5 semanas',  
    courses: 7,  
    level: 'Intermedio'  
  },  
]  
  
export function LearningPathsScreen({ navigation }: any) {  
  const renderPathItem = ({ item }: { item: typeof learningPaths[0] }) => (  
    <TouchableOpacity   
      style={styles.pathItem}  
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}  
    >  
      <View style={styles.pathHeader}>  
        <Text style={styles.pathTitle}>{item.title}</Text>  
        <Text style={styles.pathLevel}>{item.level}</Text>  
      </View>  
      <Text style={styles.pathDescription}>{item.description}</Text>  
        
      <View style={styles.pathStats}>  
        <View style={styles.statItem}>  
          <Clock size={14} color="#666" />  
          <Text style={styles.statText}>{item.duration}</Text>  
        </View>  
        <View style={styles.statItem}>  
          <BookOpen size={14} color="#666" />  
          <Text style={styles.statText}>{item.courses} cursos</Text>  
        </View>  
      </View>  
    </TouchableOpacity>  
  )  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Rutas de Aprendizaje</Text>  
        <View style={styles.headerRight} />  
      </View>  
  
      <View style={styles.content}>  
        <Text style={styles.subtitle}>  
          Caminos estructurados para tu educación financiera  
        </Text>  
          
        <FlatList  
          data={learningPaths}  
          keyExtractor={(item) => item.id}  
          renderItem={renderPathItem}  
          showsVerticalScrollIndicator={false}  
          contentContainerStyle={styles.listContainer}  
        />  
      </View>  
    </SafeAreaView>  
  )  
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
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    backgroundColor: '#fff',  
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
  content: {  
    flex: 1,  
    padding: 20,  
  },  
  subtitle: {  
    fontSize: 16,  
    color: '#666',  
    textAlign: 'center',  
    marginBottom: 20,  
  },  
  listContainer: {  
    paddingBottom: 20,  
  },  
  pathItem: {  
    backgroundColor: 'white',  
    borderRadius: 12,  
    padding: 20,  
    marginBottom: 16,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 3,  
  },  
  pathHeader: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    marginBottom: 8,  
  },  
  pathTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
    flex: 1,  
  },  
  pathLevel: {  
    fontSize: 12,  
    color: '#007AFF',  
    backgroundColor: 'rgba(0, 122, 255, 0.1)',  
    paddingHorizontal: 8,  
    paddingVertical: 4,  
    borderRadius: 12,  
    fontWeight: '500',  
  },  
  pathDescription: {  
    color: '#666',  
    marginBottom: 15,  
    lineHeight: 20,  
  },  
  pathStats: {  
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
})  
  
export default LearningPathsScreen