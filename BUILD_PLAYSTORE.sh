#!/bin/bash
# ============================================
# 🚀 BUILD RÁPIDO PARA PLAY STORE
# ============================================

echo "🔐 1. Configurando secrets..."
eas secret:create --scope project --name ELEVENLABS_API_KEY --value sk_1f761cf886d39ceccf5774358d5d5609dc298acc5d994a66 --type string --force
eas secret:create --scope project --name ELEVENLABS_VOICE_ID_FEMALE --value GJid0jgRsqjUy21Avuex --type string --force
eas secret:create --scope project --name ELEVENLABS_VOICE_ID_MALE --value 93nuHbke4dTER9x2pDwE --type string --force

echo "🏗️ 2. Creando build AAB para Play Store..."
eas build --platform android --profile production --non-interactive

echo "✅ Build completado!"
echo "📱 Descarga el AAB desde: https://expo.dev"
echo "📤 Sube el AAB a Google Play Console"
