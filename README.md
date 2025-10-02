# 📱 Investi App

Aplicación móvil de la comunidad Investi construida con React Native y Expo.

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias (usar --legacy-peer-deps por conflictos de versiones)
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# O con cache limpio
npx expo start --clear
```

### Build de Producción

```bash
# Instalar EAS CLI (si no lo tienes)
npm install -g eas-cli

# Login
eas login

# Build para Android
eas build --profile production --platform android
```

## 🛠️ Comandos Útiles

```bash
# Limpiar cache y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Iniciar con cache limpio
npx expo start --clear

# Build de desarrollo
npm run build:dev
```

## ⚠️ Notas Importantes

1. **Usar `--legacy-peer-deps`**: Hay conflictos de peer dependencies entre `expo-router` y `@react-navigation/drawer`
2. **No usar React.lazy()**: No es compatible con React Native + Hermes
3. **Metro config optimizado**: Ya configurado con `inlineRequires` para mejor performance

## 📁 Estructura del Proyecto

```
investi-jhtech-review/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── screens/        # Pantallas de la app
│   ├── contexts/       # React Contexts (Auth, Language)
│   ├── hooks/          # Custom hooks
│   ├── rest/           # API client
│   └── i18n/           # Internacionalización
├── assets/             # Imágenes y recursos
├── navigation.tsx      # Configuración de navegación
└── App.tsx            # Punto de entrada
```

## 🔧 Stack Tecnológico

- **React Native** 0.79.5
- **Expo** SDK 53
- **React Navigation** 6.x
- **Supabase** 2.45.4
- **i18next** - Internacionalización
- **Hermes** - Motor JavaScript
- **NativeWind** - Styling con Tailwind CSS

## 📦 Scripts Principales

```bash
npm start          # Iniciar con dev client
npm run dev        # Iniciar con cache limpio
npm run build:dev  # Construir APK de desarrollo
npm run lint       # Ejecutar linter
npm run test       # Ejecutar tests
```

## 🔐 Variables de Entorno

Crea un archivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 🐛 Troubleshooting

### Error de dependencias al instalar
```bash
npm install --legacy-peer-deps
```

### App no inicia o errores de módulos
```bash
npx expo start --clear
```

### Cambios en metro.config.js no se aplican
Reinicia el servidor de Metro completamente.

## 📄 Licencia

Privado - Investi Community

## 👥 Equipo

Desarrollado por el equipo de Investi.
