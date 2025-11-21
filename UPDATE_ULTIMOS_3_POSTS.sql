-- ==============================
-- ACTUALIZAR LOS ÚLTIMOS 3 POSTS
-- ==============================
-- Estos posts son de prueba y deben ser reemplazados por contenido profesional

-- Paso 1: Identificar los últimos 3 posts
-- Ejecuta este SELECT primero para ver los IDs:
SELECT id, contenido, user_id, created_at
FROM posts
WHERE community_id IS NULL  -- Posts del feed general (no de comunidades)
ORDER BY created_at DESC
LIMIT 3;

-- Paso 2: Una vez identificados los IDs, reemplazarlos en los UPDATEs de abajo
-- ========================================================================

-- POST 1: "Wooo, está aplicación está a un siguiente nivel"
UPDATE posts
SET 
  contenido = '💡 ¿Sabías que diversificar tu portafolio reduce el riesgo?

La clave del éxito financiero está en no poner todos los huevos en la misma canasta.

✅ Invierte en diferentes sectores
✅ Combina renta fija y variable
✅ Considera inversiones internacionales

¡Empieza a construir tu patrimonio hoy! 🚀

#InversiónInteligente #Diversificación #EducaciónFinanciera',
  media_url = NULL
WHERE id = 'f89da3b2-2553-4fe3-8277-60b4a1aa6255';  -- Reemplazar con el ID real

-- POST 2: "Este es mi usuario test 2"
UPDATE posts
SET 
  contenido = '🎯 Los 3 pilares de una inversión exitosa:

1️⃣ **Educación**: Conoce en qué inviertes
2️⃣ **Paciencia**: El tiempo es tu mejor aliado
3️⃣ **Disciplina**: Mantén tu estrategia

En Investi te ayudamos a dominar estos pilares con herramientas y contenido educativo de calidad.

¿Listo para comenzar tu camino financiero? 💪

#InversiónResponsable #EducaciónFinanciera #Investi',
  media_url = NULL
WHERE id = 'ff1563c7-21d4-4bb7-a465-909da9395b8a';  -- Reemplazar con el ID real

-- POST 3: "Un gusto en pertenecer a esta comunidad"
UPDATE posts
SET 
  contenido = '📊 Análisis de mercado semanal:

El mercado mostró volatilidad esta semana, pero las oportunidades de largo plazo siguen intactas.

🔹 Tecnología: Sector prometedor para 2025
🔹 Energías renovables: Crecimiento sostenido
🔹 Fondos indexados: Opción segura para principiantes

Recuerda: las mejores decisiones se toman con información y planificación.

¿Qué sectores te interesan? Déjanos tu comentario 👇

#AnálisisDeMercado #TendenciasFinancieras #Investi',
  media_url = NULL
WHERE id = '3cc923df-5a7c-49e2-bf70-13f68c5df518';  -- Reemplazar con el ID real

-- Paso 3: Verificar los cambios
SELECT id, contenido, created_at
FROM posts
WHERE id IN (
  'f89da3b2-2553-4fe3-8277-60b4a1aa6255',
  'ff1563c7-21d4-4bb7-a465-909da9395b8a',
  '3cc923df-5a7c-49e2-bf70-13f68c5df518'
)
ORDER BY created_at DESC;
