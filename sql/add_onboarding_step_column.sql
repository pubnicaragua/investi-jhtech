-- Agregar columna onboarding_step a la tabla users si no existe
-- Esta columna rastrea el progreso del usuario en el flujo de onboarding

DO $$ 
BEGIN
    -- Verificar si la columna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'onboarding_step'
    ) THEN
        -- Agregar la columna
        ALTER TABLE public.users 
        ADD COLUMN onboarding_step text DEFAULT 'welcome';
        
        RAISE NOTICE 'Columna onboarding_step agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna onboarding_step ya existe';
    END IF;
END $$;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_users_onboarding_step 
ON public.users(onboarding_step);

-- Comentario sobre la columna
COMMENT ON COLUMN public.users.onboarding_step IS 
'Rastrea el paso actual del usuario en el flujo de onboarding. 
Valores posibles: welcome, upload_avatar, pick_goals, pick_interests, pick_knowledge, complete';

-- Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'onboarding_step';
