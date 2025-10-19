# Tareas para Agregar Endpoint de Bienvenida

## Información Recopilada
- Archivo principal: `src/rest/api.ts` contiene todas las funciones de API del cliente.
- El archivo usa funciones async que llaman a `request` para interactuar con Supabase.
- Se necesita agregar una nueva función que simule un endpoint de bienvenida, registre el método y ruta de la solicitud, y retorne un mensaje de bienvenida en JSON.

## Plan
- Agregar una nueva función `getWelcomeMessage` en `src/rest/api.ts`.
- La función debe registrar el método y ruta de la solicitud usando console.log.
- Retornar un objeto JSON con un mensaje de bienvenida.

## Pasos a Completar
- [ ] Agregar la función `getWelcomeMessage` al final de `src/rest/api.ts`.
- [ ] Probar que la función funcione correctamente (simular una llamada).
- [ ] Verificar que los logs se muestren en la consola.

## Archivos Dependientes
- Ninguno adicional, solo `src/rest/api.ts`.

## Pasos Posteriores
- Integrar la función en las pantallas si es necesario.
- Probar en el entorno de desarrollo.
