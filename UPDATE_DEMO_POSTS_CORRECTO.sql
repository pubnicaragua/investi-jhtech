-- ============================================
-- UPDATE: POSTS DE DEMO - VERSIÓN CORREGIDA
-- ============================================
-- Problema: SQL anterior usaba OFFSET en subqueries que se ejecutaban múltiples veces
-- Solución: Usar IDs directos de los posts
-- ============================================

-- Ver los últimos 8 posts actuales con sus IDs
SELECT id, content, LEFT(content, 50) as preview, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 8;

-- NOTA: Copia los 8 IDs de arriba y reemplázalos en las líneas WHERE id = 'xxx' abajo

-- Post 1 (el más reciente): Planificación Financiera
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
WHERE id = 'f89da3b2-2553-4fe3-8277-60b4a1aa6255';  -- REEMPLAZAR CON ID REAL

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
WHERE id = 'ff1563c7-21d4-4bb7-a465-909da9395b8a';  -- REEMPLAZAR CON ID REAL

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
WHERE id = '3cc923df-5a7c-49e2-bf70-13f68c5df518';  -- REEMPLAZAR CON ID REAL

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
WHERE id = 'f45529a6-fbdc-4031-b7c3-e6ffc1a0575e';  -- REEMPLAZAR CON ID REAL

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
WHERE id = '2b3d9c01-385f-44da-b5a5-33b783dd27f6';  -- REEMPLAZAR CON ID REAL

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
WHERE id = '754c8eb4-f690-4389-88dc-8c899afca3e4';  -- REEMPLAZAR CON ID REAL

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
WHERE id = '0a4c4e18-e644-42df-8fb8-716f0ff814cc';  -- REEMPLAZAR CON ID REAL

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
WHERE id = '49d1b84a-b640-4784-b661-be3c2c104443';  -- REEMPLAZAR CON ID REAL

-- Verificar cambios
SELECT id, content, media_url, created_at
FROM posts
WHERE id IN (
  'f89da3b2-2553-4fe3-8277-60b4a1aa6255',
  'ff1563c7-21d4-4bb7-a465-909da9395b8a',
  '3cc923df-5a7c-49e2-bf70-13f68c5df518',
  'f45529a6-fbdc-4031-b7c3-e6ffc1a0575e',
  '2b3d9c01-385f-44da-b5a5-33b783dd27f6',
  '754c8eb4-f690-4389-88dc-8c899afca3e4',
  '0a4c4e18-e644-42df-8fb8-716f0ff814cc',
  '49d1b84a-b640-4784-b661-be3c2c104443'
)
ORDER BY created_at DESC;
