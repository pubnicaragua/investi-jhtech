-- ============================================
-- UPDATE: POSTS DE DEMO MÁS PROFESIONALES
-- ============================================
-- Problema: Posts actuales son poco profesionales
-- Solución: Actualizar últimos 8 posts con contenido educativo de calidad
-- ============================================

-- Ver los últimos 8 posts actuales
SELECT id, content, media_url, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 8;

-- ACTUALIZAR POSTS CON CONTENIDO PROFESIONAL
-- IMPORTANTE: Usar WITH para calcular IDs una sola vez
WITH ranked_posts AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM posts
)

-- Post 1: Planificación Financiera
UPDATE posts
SET 
  content = '💼 ¡Descubre nuestro Planificador Financiero! 📊

Organiza tus finanzas de manera inteligente:
✅ Establece presupuestos mensuales
✅ Rastrea tus gastos automáticamente  
✅ Alcanza tus metas de ahorro

¿Listo para tomar control de tu dinero? 

#EducaciónFinanciera #Investi #PlanificaciónFinanciera',
  media_url = NULL
WHERE id = (SELECT id FROM ranked_posts WHERE rn = 1);

-- Post 2: Caza Hormigas
UPDATE posts
SET 
  content = '🐜 ¿Sabías que gastas más de lo que piensas en pequeñas compras?

Nuestro Caza Hormigas te ayuda a:
📍 Identificar gastos innecesarios
📍 Rastrear suscripciones olvidadas
📍 Ahorrar hasta $200 al mes

¡Los pequeños gastos se convierten en grandes ahorros! 💰

#CazaHormigas #AhorroInteligente',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 1);

-- Post 3: Criptomonedas
UPDATE posts
SET 
  content = '🚀 Bitcoin alcanza nuevo máximo histórico! 📈

¿Qué significa esto para ti?
• Mayor adopción institucional
• Oportunidades de aprendizaje
• Importancia de la educación financiera

⚠️ Recuerda: Invierte solo lo que puedes permitirte perder y siempre investiga antes de invertir.

#Bitcoin #Criptomonedas #InvertSmart',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 2);

-- Post 4: Comunidades
UPDATE posts
SET 
  content = '🎓 ¡Únete a las Comunidades de Investi!

Conecta con jóvenes que comparten tus intereses:
🌟 Comunidades Públicas: Networking abierto
🔐 Comunidades Privadas: Grupos exclusivos
🏫 Comunidades de Colegio: Metas grupales

¡Aprende, comparte y crece con nosotros!

#ComunidadInvesti #Networking',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 3);

-- Post 5: Meta de Ahorro
UPDATE posts
SET 
  content = '🎯 Crea tu primera meta de ahorro grupal!

Ideal para:
• Giras de estudios
• Proyectos universitarios  
• Eventos sociales

Junta fondos con tus amigos de forma transparente y organizada.

¿Cuál será tu primera meta? 💪

#MetasDeAhorro #TrabajoEnEquipo',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 4);

-- Post 6: Cursos
UPDATE posts
SET 
  content = '📚 Nuevos cursos disponibles en Investi!

Aprende sobre:
1️⃣ Finanzas Personales Básicas
2️⃣ Introducción a la Inversión
3️⃣ Criptomonedas para Principiantes
4️⃣ Emprendimiento Digital

100% gratis y a tu ritmo 🎓

#AprendeConInvesti #CursosGratis',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 5);

-- Post 7: Reportes
UPDATE posts
SET 
  content = '📊 Genera reportes financieros profesionales

Obtén insights sobre:
📈 Tendencias de gasto
💳 Categorías más caras
📉 Oportunidades de ahorro
📅 Proyecciones futuras

Toma decisiones informadas basadas en tus datos reales.

#ReportesFinancieros #DataDriven',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 6);

-- Post 8: IRI Asistente
UPDATE posts
SET 
  content = '🤖 Conoce a Irï, tu asistente financiero IA!

Pregúntale sobre:
💡 Consejos de ahorro personalizados
📖 Conceptos financieros
🎯 Cómo alcanzar tus metas
🏦 Información sobre inversiones

Disponible 24/7 para ayudarte a mejorar tus finanzas.

#IrïAI #AsistenteFinanciero',
  media_url = NULL
WHERE id = (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 7);

-- Verificar cambios
SELECT id, content, media_url, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 8;
