# 🔧 Configuración de APIs de Mercado

## ❌ Problema: Financial Modeling Prep API

La API de Financial Modeling Prep (FMP) tiene endpoints legacy que **ya no están disponibles** para nuevas API keys desde agosto 31, 2025:

```
"Error Message": "Legacy Endpoint : Due to Legacy endpoints being no longer supported - 
This endpoint is only available for legacy users who have valid subscriptions prior August 31, 2025."
```

## ✅ Solución: APIs Alternativas Gratuitas

Hemos migrado a dos APIs gratuitas y confiables:

### 1. **Finnhub API** (Principal - Cotizaciones en tiempo real)
- **Límite**: 60 requests/minuto
- **Función**: Precios en tiempo real, información de compañías
- **Costo**: 100% GRATIS

### 2. **Alpha Vantage API** (Secundaria - Búsqueda de acciones)
- **Límite**: 25 requests/día
- **Función**: Búsqueda de símbolos de acciones
- **Costo**: 100% GRATIS

---

## 📝 Paso a Paso: Obtener API Keys

### 🔹 Finnhub API (OBLIGATORIA)

1. **Ir a**: https://finnhub.io/register
2. **Registrarse** con email (no requiere tarjeta de crédito)
3. **Verificar email** y hacer login
4. **Copiar tu API Key** del dashboard
5. **Agregar al archivo `.env`**:
   ```env
   EXPO_PUBLIC_FINNHUB_API_KEY=tu-api-key-aqui
   ```

### 🔹 Alpha Vantage API (OPCIONAL - para búsqueda)

1. **Ir a**: https://www.alphavantage.co/support/#api-key
2. **Llenar el formulario** (nombre, email, organización)
3. **Copiar la API Key** que aparece inmediatamente
4. **Agregar al archivo `.env`**:
   ```env
   EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY=tu-api-key-aqui
   ```

---

## 🚀 Configuración Rápida

### 1. Copiar archivo de ejemplo
```bash
cp .env.example .env
```

### 2. Editar `.env` con tus API keys
```env
# Finnhub API (OBLIGATORIA)
EXPO_PUBLIC_FINNHUB_API_KEY=cvcqk79r01qhon9i1u10cvcqk79r01qhon9i1u1g

# Alpha Vantage API (OPCIONAL)
EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY=DEMO
```

### 3. Reiniciar la app
```bash
npm start
```

---

## 🧪 Validar que funciona

### Opción 1: Ver logs en consola
```
📊 [getMarketStocks] Obteniendo datos con Finnhub API
✅ [Finnhub] AAPL: $150.25
✅ [Finnhub] GOOGL: $2800.50
✅ [getMarketStocks] 8 acciones obtenidas
```

### Opción 2: Probar manualmente
```bash
# Finnhub - Cotización de Apple
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=TU_API_KEY"

# Alpha Vantage - Búsqueda
curl "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=Apple&apikey=TU_API_KEY"
```

---

## ⚠️ Limitaciones y Recomendaciones

### Finnhub (60 req/min)
- ✅ Suficiente para uso normal
- ⚠️ Evitar loops infinitos
- 💡 Implementado delay de 1.1s entre requests

### Alpha Vantage (25 req/día)
- ✅ Solo se usa para búsqueda (poco frecuente)
- ⚠️ Si excedes el límite, espera 24 horas
- 💡 Considera cachear resultados de búsqueda

---

## 🔄 Alternativas Adicionales (si necesitas más)

### Twelve Data
- **Límite**: 800 requests/día
- **Registro**: https://twelvedata.com/pricing
- **Gratis**: Sí

### Yahoo Finance (via RapidAPI)
- **Límite**: 500 requests/mes
- **Registro**: https://rapidapi.com/apidojo/api/yahoo-finance1
- **Gratis**: Sí (plan básico)

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que las API keys estén en el archivo `.env`
2. Reinicia la app (`npm start`)
3. Revisa los logs de consola
4. Verifica que las API keys sean válidas en los dashboards

---

## 📊 Comparación de APIs

| API | Límite | Cotizaciones | Búsqueda | Logos | Gratis |
|-----|--------|--------------|----------|-------|--------|
| **Finnhub** | 60/min | ✅ | ❌ | ✅ | ✅ |
| **Alpha Vantage** | 25/día | ✅ | ✅ | ❌ | ✅ |
| FMP (legacy) | ❌ | ❌ | ❌ | ❌ | ❌ |

---

**Última actualización**: Octubre 29, 2025
