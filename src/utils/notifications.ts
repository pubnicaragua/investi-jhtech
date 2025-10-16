import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicitar permisos para notificaciones
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permisos de notificación denegados');
    return false;
  }

  console.log('Permisos de notificación concedidos');
  return true;
}

// Mostrar una notificación de prueba
export async function showTestNotification() {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    console.log('No se pueden mostrar notificaciones sin permisos');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Bienvenido a Investi! 🎉',
      body: 'Esta es una notificación de prueba. ¡Tu app está funcionando correctamente!',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: '#2673f3',
    },
    trigger: null, // Mostrar inmediatamente
  });

  console.log('Notificación de prueba enviada');
}

// Mostrar notificación de bienvenida después del login
export async function showWelcomeNotification() {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    console.log('No se pueden mostrar notificaciones sin permisos');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Sesión iniciada! ✅',
      body: 'Has iniciado sesión correctamente en Investi. ¡Bienvenido!',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
      color: '#2673f3',
    },
    trigger: null, // Mostrar inmediatamente
  });

  console.log('Notificación de bienvenida enviada');
}

// Configurar canal de notificaciones para Android
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2673f3',
    });
  }
}
