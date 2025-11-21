-- STORAGE BUCKET: support_attachments
-- Crear en Supabase > Storage > Buckets
-- Nombre: support_attachments
-- Privado: No

-- POLÍTICAS DE STORAGE

-- SELECT: Usuarios autenticados pueden descargar sus propios adjuntos
CREATE POLICY "Users can download own attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'support_attachments' 
    AND auth.uid() IS NOT NULL
  );

-- INSERT: Usuarios autenticados pueden subir archivos
CREATE POLICY "Users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'support_attachments' 
    AND auth.uid() IS NOT NULL
  );

-- DELETE: Solo admin puede eliminar
CREATE POLICY "Admin can delete attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'support_attachments' 
    AND auth.role() = 'authenticated'
  );
