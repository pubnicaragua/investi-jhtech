-- Función RPC para obtener promociones con búsqueda
CREATE OR REPLACE FUNCTION public.get_promotions(
  p_user_id UUID,
  p_search TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  discount TEXT,
  image_url TEXT,
  valid_until DATE,
  location TEXT,
  terms TEXT,
  category TEXT,
  active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.discount,
    p.image_url,
    p.valid_until,
    p.location,
    p.terms,
    p.category,
    p.active,
    p.created_at
  FROM public.promotions p
  WHERE 
    p.active = TRUE
    AND (
      p_search = '' 
      OR p.title ILIKE '%' || p_search || '%'
      OR p.description ILIKE '%' || p_search || '%'
      OR p.category ILIKE '%' || p_search || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT 10;
END;
$$;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.get_promotions(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_promotions(UUID, TEXT) TO anon;
