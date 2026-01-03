/**
 * ============================================================================
 * COURSE AUTOMATION SERVICE
 * ============================================================================
 * 
 * Servicio para automatizar la generación de contenido de cursos usando IA
 * - Genera lecciones automáticamente con GROK
 * - Actualiza cursos existentes sin contenido
 * - Maneja errores y reintentos
 * - Guarda progreso en Supabase
 */

import { supabase } from '../supabase'
import { generateLessonWithAI } from '../rest/api'

interface Lesson {
  id: string
  course_id: string
  titulo: string
  descripcion: string
  content?: string
  duration?: number
  order: number
}

interface Course {
  id: string
  title: string
  description: string
  lessons?: Lesson[]
}

/**
 * Genera contenido para todas las lecciones de un curso
 */
export async function generateCourseContent(courseId: string): Promise<{
  success: boolean
  generated: number
  failed: number
  errors: string[]
}> {
  console.log(`📚 [CourseAutomation] Iniciando generación de contenido para curso: ${courseId}`)
  
  const result = {
    success: true,
    generated: 0,
    failed: 0,
    errors: [] as string[]
  }

  try {
    // Obtener lecciones del curso
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true })

    if (error) {
      console.error('❌ Error obteniendo lecciones:', error)
      result.success = false
      result.errors.push(`Error obteniendo lecciones: ${error.message}`)
      return result
    }

    if (!lessons || lessons.length === 0) {
      console.log('⚠️ No hay lecciones para este curso')
      return result
    }

    console.log(`📖 Encontradas ${lessons.length} lecciones`)

    // Generar contenido para cada lección sin contenido
    for (const lesson of lessons) {
      // Saltar si ya tiene contenido válido
      if (lesson.content && 
          lesson.content.trim() !== '' && 
          !lesson.content.includes('Aquí iría') &&
          lesson.content.length > 100) {
        console.log(`✅ Lección "${lesson.titulo}" ya tiene contenido`)
        continue
      }

      try {
        console.log(`🤖 Generando contenido para: "${lesson.titulo}"`)
        
        const content = await generateLessonWithAI(
          lesson.titulo || 'Lección financiera',
          lesson.descripcion || 'Contenido educativo sobre finanzas'
        )

        // Guardar en base de datos
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ 
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', lesson.id)

        if (updateError) {
          console.error(`❌ Error guardando lección ${lesson.id}:`, updateError)
          result.failed++
          result.errors.push(`Error guardando "${lesson.titulo}": ${updateError.message}`)
        } else {
          console.log(`✅ Contenido generado y guardado para: "${lesson.titulo}"`)
          result.generated++
        }

        // Pequeña pausa entre generaciones para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error: any) {
        console.error(`❌ Error generando lección "${lesson.titulo}":`, error)
        result.failed++
        result.errors.push(`Error en "${lesson.titulo}": ${error.message}`)
      }
    }

    console.log(`📊 Resumen: ${result.generated} generadas, ${result.failed} fallidas`)
    return result

  } catch (error: any) {
    console.error('❌ Error general en generación de curso:', error)
    result.success = false
    result.errors.push(`Error general: ${error.message}`)
    return result
  }
}

/**
 * Genera contenido para todos los cursos que no tienen lecciones con contenido
 */
export async function generateAllCoursesContent(): Promise<{
  totalCourses: number
  processed: number
  totalGenerated: number
  totalFailed: number
  errors: string[]
}> {
  console.log('🚀 [CourseAutomation] Iniciando generación masiva de contenido')
  
  const summary = {
    totalCourses: 0,
    processed: 0,
    totalGenerated: 0,
    totalFailed: 0,
    errors: [] as string[]
  }

  try {
    // Obtener todos los cursos
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, description')

    if (error) {
      console.error('❌ Error obteniendo cursos:', error)
      summary.errors.push(`Error obteniendo cursos: ${error.message}`)
      return summary
    }

    if (!courses || courses.length === 0) {
      console.log('⚠️ No hay cursos en la base de datos')
      return summary
    }

    summary.totalCourses = courses.length
    console.log(`📚 Encontrados ${courses.length} cursos`)

    // Procesar cada curso
    for (const course of courses) {
      console.log(`\n📖 Procesando curso: "${course.title}"`)
      
      const result = await generateCourseContent(course.id)
      
      summary.processed++
      summary.totalGenerated += result.generated
      summary.totalFailed += result.failed
      summary.errors.push(...result.errors)

      // Pausa entre cursos
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log('\n✅ Generación masiva completada')
    console.log(`📊 Resumen final:`)
    console.log(`   - Cursos procesados: ${summary.processed}/${summary.totalCourses}`)
    console.log(`   - Lecciones generadas: ${summary.totalGenerated}`)
    console.log(`   - Lecciones fallidas: ${summary.totalFailed}`)
    
    return summary

  } catch (error: any) {
    console.error('❌ Error en generación masiva:', error)
    summary.errors.push(`Error general: ${error.message}`)
    return summary
  }
}

/**
 * Verifica el estado de generación de contenido de un curso
 */
export async function checkCourseContentStatus(courseId: string): Promise<{
  totalLessons: number
  withContent: number
  withoutContent: number
  percentage: number
  lessons: Array<{ id: string; titulo: string; hasContent: boolean }>
}> {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, titulo, content')
    .eq('course_id', courseId)
    .order('order', { ascending: true })

  if (error || !lessons) {
    return {
      totalLessons: 0,
      withContent: 0,
      withoutContent: 0,
      percentage: 0,
      lessons: []
    }
  }

  const withContent = lessons.filter((l: any) => 
    l.content && 
    l.content.trim() !== '' && 
    !l.content.includes('Aquí iría') &&
    l.content.length > 100
  ).length

  return {
    totalLessons: lessons.length,
    withContent,
    withoutContent: lessons.length - withContent,
    percentage: lessons.length > 0 ? Math.round((withContent / lessons.length) * 100) : 0,
    lessons: lessons.map((l: any) => ({
      id: l.id,
      titulo: l.titulo,
      hasContent: !!(l.content && l.content.trim() !== '' && !l.content.includes('Aquí iría') && l.content.length > 100)
    }))
  }
}
