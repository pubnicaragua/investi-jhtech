# ✅ Checklist de Configuración - Market Info API

## 📋 Lista de Tareas

### Paso 1: Obtener API Keys (3 minutos)

#### Finnhub (OBLIGATORIA)
- [ ] Ir a https://finnhub.io/register
- [ ] Crear cuenta con email
- [ ] Verificar email
- [ ] Hacer login en Finnhub
- [ ] Ir al Dashboard
- [ ] Copiar API Key
- [ ] Guardar API Key en un lugar seguro

#### Alpha Vantage (OPCIONAL pero recomendada)
- [ ] Ir a https://www.alphavantage.co/support/#api-key
- [ ] Llenar formulario (nombre, email, organización)
- [ ] Copiar API Key que aparece
- [ ] Guardar API Key en un lugar seguro

---

### Paso 2: Configurar Proyecto (2 minutos)

- [ ] Abrir el proyecto en VS Code
- [ ] Localizar archivo `.env` en la raíz del proyecto
- [ ] Si no existe `.env`, copiar `.env.example` y renombrar a `.env`
- [ ] Abrir archivo `.env` en el editor
- [ ] Agregar/actualizar estas líneas:
  ```env
  EXPO_PUBLIC_FINNHUB_API_KEY=tu-api-key-de-finnhub-aqui
  EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY=tu-api-key-de-alphavantage-aqui
  ```
- [ ] Reemplazar `tu-api-key-de-finnhub-aqui` con tu API key real de Finnhub
- [ ] Reemplazar `tu-api-key-de-alphavantage-aqui` con tu API key real de Alpha Vantage
- [ ] Guardar el archivo `.env`
- [ ] Verificar que no haya espacios extra antes o después de las API keys

---

### Paso 3: Validar Configuración (1 minuto)

- [ ] Abrir terminal en el proyecto
- [ ] Ejecutar: `npm run test:apis`
- [ ] Verificar que aparezca:
  ```
  ✅ Finnhub Quote funciona!
  ✅ Finnhub Profile funciona!
  ✅ Alpha Vantage Search funciona!
  ```
- [ ] Si hay errores, revisar que las API keys estén correctas en `.env`

---

### Paso 4: Reiniciar App (1 minuto)

- [ ] Detener el servidor si está corriendo (Ctrl+C)
- [ ] Ejecutar: `npm start`
- [ ] Esperar a que inicie el servidor
- [ ] Abrir la app en el dispositivo/emulador
- [ ] Ir a la sección "Market Info"
- [ ] Verificar que se carguen las acciones

---

### Paso 5: Verificar en la App (1 minuto)

- [ ] Abrir Market Info en la app
- [ ] Verificar que se muestren las acciones (AAPL, GOOGL, etc.)
- [ ] Verificar que se muestren precios actualizados
- [ ] Verificar que se muestren los cambios porcentuales
- [ ] Probar la búsqueda de acciones
- [ ] Verificar que aparezcan logos de compañías

---

### Paso 6: Revisar Logs (Opcional)

- [ ] Abrir consola de desarrollo
- [ ] Buscar mensajes como:
  ```
  📊 [getMarketStocks] Obteniendo datos con Finnhub API
  ✅ [Finnhub] AAPL: $150.25
  ✅ [getMarketStocks] 8 acciones obtenidas
  ```
- [ ] Verificar que no haya errores de API

---

## 🚨 Troubleshooting

### Si `npm run test:apis` falla:

#### Error: "Invalid API KEY"
- [ ] Verificar que la API key esté correcta en `.env`
- [ ] Verificar que no haya espacios extra
- [ ] Verificar que el prefijo sea `EXPO_PUBLIC_`
- [ ] Reiniciar terminal y volver a ejecutar

#### Error: "Cannot find module"
- [ ] Ejecutar: `npm install`
- [ ] Volver a ejecutar: `npm run test:apis`

#### Error: "Rate limit exceeded"
- [ ] Esperar 1 minuto (Finnhub: 60 req/min)
- [ ] O esperar 24 horas (Alpha Vantage: 25 req/día)

### Si la app no muestra datos:

- [ ] Verificar que `.env` esté en la raíz del proyecto
- [ ] Verificar que las API keys estén correctas
- [ ] Reiniciar completamente la app (cerrar y volver a abrir)
- [ ] Ejecutar: `npm start --clear` (limpiar caché)
- [ ] Revisar logs de consola para errores

---

## 📞 Soporte Adicional

Si después de seguir todos los pasos aún tienes problemas:

1. **Leer documentación completa:**
   - [ ] Abrir `MARKET_API_SETUP.md`
   - [ ] Leer sección de troubleshooting

2. **Verificar archivos:**
   - [ ] `RESUMEN_PARA_CLIENTE.md` - Resumen ejecutivo
   - [ ] `SOLUCION_API_MERCADO.txt` - Guía rápida
   - [ ] `API_KEYS_DEMO.txt` - Keys de prueba (solo para testing)

3. **Contactar soporte:**
   - [ ] Compartir logs de error
   - [ ] Compartir resultado de `npm run test:apis`
   - [ ] Indicar qué paso del checklist falló

---

## ✅ Confirmación Final

Una vez completados todos los pasos:

- [ ] Market Info carga correctamente
- [ ] Se muestran precios en tiempo real
- [ ] La búsqueda funciona
- [ ] No hay errores en consola
- [ ] Las API keys están guardadas de forma segura
- [ ] El archivo `.env` NO está en git (verificar .gitignore)

---

**Tiempo total estimado:** 5-8 minutos  
**Última actualización:** Octubre 29, 2025

---

## 🎉 ¡Listo!

Si todos los checkboxes están marcados, la configuración está completa y Market Info debería funcionar perfectamente con las nuevas APIs gratuitas.
