# 📱 Investi App

Aplicación móvil de la comunidad Investi construida con React Native y Expo.

## 🚀 Inicio Rápido

### ⚠️ IMPORTANTE
**NO usar Expo Go**. Esta app requiere un Development Build debido a módulos nativos.

### Instalación

```bash
# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### Primera vez: Construir Development Build

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Construir APK de desarrollo
npm run build:dev
```

Instala el APK generado en tu teléfono Android.

### Desarrollo Diario

```bash
# Iniciar metro bundler
npm start

# Escanea el QR con tu teléfono
# La app se abrirá en el Development Build
```

## 📚 Documentación

- **[DESARROLLO.md](./DESARROLLO.md)** - Guía completa de desarrollo
- **[eas.json](./eas.json)** - Configuración de builds

## 🛠️ Stack Tecnológico

- **React Native** 0.79.5
- **Expo** SDK 53
- **Expo Router** - Navegación basada en archivos
- **Supabase** - Backend y autenticación
- **NativeWind** - Styling con Tailwind CSS
- **React Query** - Gestión de estado del servidor
- **React Hook Form** + **Zod** - Formularios y validación

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

### Error: "PlatformConstants could not be found"
Estás usando Expo Go. Usa el Development Build.

### Botones no funcionan
Reconstruye el Development Build: `npm run build:dev`

### Más ayuda
Ver [DESARROLLO.md](./DESARROLLO.md) para solución de problemas detallada.

## 📄 Licencia

Privado - Investi Community

## 👥 Equipo

Desarrollado por el equipo de Investi.
