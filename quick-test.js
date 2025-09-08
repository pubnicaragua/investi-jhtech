// Prueba rápida de conectividad
console.log('Iniciando prueba rápida...');

try {
  // Verificar que podemos importar Supabase
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase importado correctamente');
  
  // Crear cliente
  const supabase = createClient(
    'https://paoliakwfoczcallnecf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o'
  );
  console.log('✅ Cliente Supabase creado');
  
  // Hacer una consulta simple
  supabase
    .from('users')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log('✅ Conexión exitosa a la base de datos');
        console.log('🎉 ¡Tu aplicación puede conectarse correctamente!');
      }
    })
    .catch(err => {
      console.log('❌ Error de conexión:', err.message);
    });
    
} catch (error) {
  console.log('❌ Error:', error.message);
}
