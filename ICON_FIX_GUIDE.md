# Guía para Solucionar el Icono de la App

## Problema
El icono de la app se ve muy grande cuando se instala en el teléfono Android.

## Causa
Android usa **Adaptive Icons** que requieren:
1. Un **foreground** (la parte visible del icono)
2. Un **background** (el fondo)

El sistema Android recorta y escala automáticamente el foreground, por lo que si el logo ocupa todo el espacio, se verá muy grande.

## Solución

### Opción 1: Crear un Adaptive Icon correcto (RECOMENDADO)

Necesitas crear 2 imágenes:

1. **Foreground Image** (`assets/adaptive-icon-foreground.png`):
   - Tamaño: 1024x1024px
   - El logo debe ocupar solo el **66%** del centro (aprox 680x680px)
   - Dejar **margen transparente** alrededor (172px en cada lado)
   - Fondo: Transparente

2. **Background** (usar color sólido):
   - Color: `#FFFFFF` o el color de tu marca

### Opción 2: Usar el mismo icono con ajustes

Si no puedes crear un nuevo foreground, ajusta el actual:

```javascript
// En app.config.js
android: {
  package: 'com.investi.app',
  versionCode: 1,
  adaptiveIcon: {
    foregroundImage: './assets/investi-logo-adaptive.png', // Nuevo archivo con padding
    backgroundColor: '#FFFFFF',
    // Opcional: agregar monochromeImage para Android 13+
    monochromeImage: './assets/investi-logo-mono.png'
  },
  jsEngine: 'hermes'
}
```

## Pasos para Implementar

### 1. Preparar las Imágenes

Pide a tu diseñador que cree:

- `investi-logo-adaptive.png` (1024x1024px)
  - Logo centrado ocupando solo 680x680px
  - Margen transparente de 172px en cada lado
  - Formato: PNG con transparencia

### 2. Actualizar app.config.js

```javascript
android: {
  package: 'com.investi.app',
  versionCode: 2, // Incrementar versión
  adaptiveIcon: {
    foregroundImage: './assets/investi-logo-adaptive.png',
    backgroundColor: '#FFFFFF'
  },
  jsEngine: 'hermes'
}
```

### 3. Rebuild y Test

```bash
# Limpiar cache
npx expo start -c

# Crear nuevo build
eas build --platform android --profile production
```

## Herramientas Útiles

1. **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Genera automáticamente adaptive icons correctos

2. **Figma Template**: Buscar "Android Adaptive Icon Template"

3. **Photoshop/Illustrator**: Usar guías de 1024x1024px con safe zone de 680x680px

## Validación

Después de crear el nuevo build:
1. Instalar en dispositivo Android
2. Verificar que el icono se vea del tamaño correcto
3. Probar en diferentes launchers (Samsung, Pixel, etc.)

## Notas Importantes

- **NO puedo solucionar esto directamente** porque requiere editar archivos de imagen
- Delega esto a tu diseñador o desarrollador con acceso a herramientas de diseño
- El problema es de diseño, no de código

## Referencias

- [Expo Adaptive Icons](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/#adaptive-icons-android-only)
- [Android Adaptive Icons Guide](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
