# 📊 Comparación de APIs de Mercado

## Resumen Ejecutivo

Tienes **3 opciones** para obtener datos de mercado:

| API | Estado | Límite | Costo | Recomendación |
|-----|--------|--------|-------|---------------|
| **Finnhub** | ✅ Configurada | 60 req/min | GRATIS | ⭐⭐⭐⭐⭐ PRINCIPAL |
| **Alpha Vantage** | ✅ Configurada | 25 req/día | GRATIS | ⭐⭐⭐⭐ BÚSQUEDA |
| **SerpAPI Google Finance** | 📝 Opcional | 100 req/mes | GRATIS | ⭐⭐⭐ PREMIUM |

---

## 1️⃣ Finnhub API (PRINCIPAL) ✅

### ✅ Ventajas
- ✅ **60 requests/minuto** (muy generoso)
- ✅ **100% GRATIS** sin tarjeta
- ✅ **Datos en tiempo real**
- ✅ **Información de compañías + logos**
- ✅ **Muy confiable** (99.9% uptime)
- ✅ **Fácil de usar**

### ❌ Desventajas
- ❌ No tiene búsqueda de símbolos
- ❌ Requiere peticiones individuales por símbolo

### 📝 Uso Actual
```typescript
// Ya implementado en searchApiService.ts
getMarketStocks() // Cotizaciones en tiempo real
fetchStockData(symbol) // Datos de un símbolo específico
```

### 🔑 Tu API Key
```
EXPO_PUBLIC_FINNHUB_API_KEY=demo
```
⚠️ **PENDIENTE:** Obtener tu propia key en https://finnhub.io/register

---

## 2️⃣ Alpha Vantage API (BÚSQUEDA) ✅

### ✅ Ventajas
- ✅ **Búsqueda de símbolos** (muy buena)
- ✅ **100% GRATIS**
- ✅ **Datos históricos**
- ✅ **API Key ya configurada**

### ❌ Desventajas
- ❌ Solo **25 requests/día** (limitado)
- ❌ No es ideal para cotizaciones en tiempo real

### 📝 Uso Actual
```typescript
// Ya implementado en searchApiService.ts
searchStocks(query) // Buscar acciones por nombre o símbolo
```

### 🔑 Tu API Key (YA CONFIGURADA) ✅
```
EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY=PBNP643J4TWTBIAB
```

---

## 3️⃣ SerpAPI Google Finance (OPCIONAL) 📝

### ✅ Ventajas
- ✅ **Datos de Google Finance** (muy completos)
- ✅ **Múltiples categorías:**
  - Índices de mercado
  - Más activas
  - Ganadores/Perdedores
  - Criptomonedas
  - Noticias relacionadas
- ✅ **Datos estructurados** (JSON limpio)
- ✅ **100 búsquedas/mes gratis**

### ❌ Desventajas
- ❌ **Límite bajo** (100/mes = ~3/día)
- ❌ **Requiere registro** con email
- ❌ **Scraping de Google** (puede ser bloqueado)
- ❌ **No es tiempo real** (datos de Google Finance)

### 📝 Uso Potencial
```typescript
// Implementado en serpApiService.ts (OPCIONAL)
getSerpApiMarketIndexes() // Índices de mercado
getSerpApiMostActive() // Más activas
getSerpApiGainers() // Ganadores
getSerpApiLosers() // Perdedores
getSerpApiCryptocurrencies() // Criptomonedas
```

### 🔑 Configuración
```
EXPO_PUBLIC_SERPAPI_KEY=tu-serpapi-key-aqui
```
📝 Obtener en: https://serpapi.com/users/sign_up

---

## 🎯 Recomendación de Uso

### Estrategia Óptima (Actual)

```
┌─────────────────────────────────────────────────┐
│  FINNHUB (Principal)                            │
│  • Cotizaciones en tiempo real                 │
│  • Información de compañías                     │
│  • 60 req/min (suficiente)                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  ALPHA VANTAGE (Búsqueda)                       │
│  • Buscar símbolos de acciones                  │
│  • 25 req/día (suficiente para búsqueda)        │
└─────────────────────────────────────────────────┘
```

### Estrategia con SerpAPI (Opcional)

```
┌─────────────────────────────────────────────────┐
│  FINNHUB (Principal)                            │
│  • Cotizaciones en tiempo real                 │
│  • 60 req/min                                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  ALPHA VANTAGE (Búsqueda)                       │
│  • Buscar símbolos                              │
│  • 25 req/día                                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  SERPAPI (Categorías especiales)                │
│  • Ganadores/Perdedores del día                 │
│  • Criptomonedas                                │
│  • 100 req/mes (usar con moderación)            │
└─────────────────────────────────────────────────┘
```

---

## 📊 Comparación Detallada

| Característica | Finnhub | Alpha Vantage | SerpAPI |
|----------------|---------|---------------|---------|
| **Límite diario** | 86,400 | 25 | ~3 |
| **Tiempo real** | ✅ Sí | ⚠️ Limitado | ❌ No |
| **Búsqueda** | ❌ No | ✅ Excelente | ✅ Buena |
| **Logos** | ✅ Sí | ❌ No | ⚠️ Limitado |
| **Noticias** | ✅ Sí | ❌ No | ✅ Sí |
| **Criptomonedas** | ✅ Sí | ⚠️ Limitado | ✅ Sí |
| **Históricos** | ✅ Sí | ✅ Excelente | ❌ No |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Confiabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 Próximos Pasos

### Configuración Mínima (RECOMENDADA)
1. ✅ Alpha Vantage ya configurada: `PBNP643J4TWTBIAB`
2. ⏳ Obtener Finnhub API key: https://finnhub.io/register
3. ✅ Probar con: `npm run test:apis`

### Configuración Completa (OPCIONAL)
1. ✅ Finnhub configurada
2. ✅ Alpha Vantage configurada
3. 📝 Obtener SerpAPI key: https://serpapi.com/users/sign_up
4. 📝 Descomentar en `.env`: `EXPO_PUBLIC_SERPAPI_KEY=...`
5. 📝 Integrar `serpApiService.ts` en la app

---

## 💡 Casos de Uso

### Caso 1: App Básica (Solo Finnhub + Alpha Vantage)
```typescript
// Pantalla principal: Mostrar acciones populares
const stocks = await getMarketStocks(); // Finnhub

// Búsqueda: Encontrar acciones
const results = await searchStocks('Apple'); // Alpha Vantage
```

### Caso 2: App Avanzada (+ SerpAPI)
```typescript
// Pantalla principal: Mostrar acciones populares
const stocks = await getMarketStocks(); // Finnhub

// Tab "Ganadores": Mostrar ganadores del día
const gainers = await getSerpApiGainers(); // SerpAPI (1 vez al día)

// Tab "Criptomonedas": Mostrar criptos
const cryptos = await getSerpApiCryptocurrencies(); // SerpAPI
```

---

## ⚠️ Limitaciones y Consejos

### Finnhub
- ✅ Usar para cotizaciones en tiempo real
- ✅ Implementar delay de 1.1s entre requests
- ⚠️ No exceder 60 req/min

### Alpha Vantage
- ✅ Usar SOLO para búsqueda
- ⚠️ Cachear resultados de búsqueda
- ⚠️ No usar para cotizaciones (límite muy bajo)

### SerpAPI
- ⚠️ Usar SOLO para categorías especiales
- ⚠️ Cachear resultados (duran 1 hora)
- ⚠️ No usar para cotizaciones individuales
- 💡 Ideal para "Ganadores del día" (1 request/día)

---

## 📞 Soporte

### Si tienes problemas:

1. **Finnhub no funciona:**
   - Verificar API key en `.env`
   - Ejecutar: `npm run test:apis`
   - Ver logs de consola

2. **Alpha Vantage límite excedido:**
   - Esperar 24 horas
   - Implementar caché de búsquedas

3. **SerpAPI límite excedido:**
   - Esperar hasta el próximo mes
   - Considerar plan de pago ($50/mes = 5000 búsquedas)

---

**Última actualización:** Octubre 29, 2025  
**Configuración actual:** Finnhub (pendiente) + Alpha Vantage (✅) + SerpAPI (opcional)
