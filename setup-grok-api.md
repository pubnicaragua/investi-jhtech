# 🔑 Configuración de Grok API Key

## Ya tienes la API Key en .env ✅

```
EXPO_PUBLIC_GROK_API_KEY=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
```

## Configurar en EAS Secrets

### Opción 1: Comando Nuevo (Recomendado)
```bash
eas env:create --scope project --name EXPO_PUBLIC_GROK_API_KEY --value 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
```

### Opción 2: Comando Interactivo
```bash
eas secret:create
# Seleccionar: string
# Name: EXPO_PUBLIC_GROK_API_KEY
# Value: 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
# Scope: project
```

### Opción 3: Dashboard de Expo
1. Ir a https://expo.dev
2. Seleccionar tu proyecto
3. Ir a "Secrets"
4. Agregar nuevo secret:
   - Name: `EXPO_PUBLIC_GROK_API_KEY`
   - Value: `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`

## Verificar que se configuró

```bash
eas secret:list
```

Deberías ver:
```
┌──────────────────────────────┬─────────┬─────────────┐
│ Name                         │ Type    │ Updated     │
├──────────────────────────────┼─────────┼─────────────┤
│ EXPO_PUBLIC_GROK_API_KEY     │ string  │ just now    │
└──────────────────────────────┴─────────┴─────────────┘
```

## Rebuild de la App

```bash
# Limpiar cache
npx expo start -c

# Build de producción
eas build --platform android --profile production
```

## Verificar en la App

Después del build, la API key estará disponible automáticamente en:
```typescript
process.env.EXPO_PUBLIC_GROK_API_KEY
```

## ✅ Checklist

- [x] API Key en .env
- [ ] Configurar en EAS Secrets
- [ ] Verificar con `eas secret:list`
- [ ] Rebuild de la app
- [ ] Probar generación de lecciones con Irï
