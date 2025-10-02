import { useCallback, useEffect, useRef } from 'react'
import { InteractionManager } from 'react-native'

/**
 * ⚡ Hook de Performance Global
 * Optimiza la carga de datos y renderizado de pantallas
 */
export function usePerformance() {
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Ejecuta una función después de que las animaciones terminen
   * Evita bloquear la navegación con carga de datos
   */
  const runAfterInteractions = useCallback((callback: () => void) => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (isMountedRef.current) {
        callback()
      }
    })

    return () => task.cancel()
  }, [])

  /**
   * Debounce para evitar llamadas excesivas
   */
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }, [])

  /**
   * Throttle para limitar ejecuciones
   */
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }, [])

  return {
    runAfterInteractions,
    debounce,
    throttle,
    isMounted: isMountedRef.current,
  }
}
