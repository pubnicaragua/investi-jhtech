import React, { useState } from 'react'
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from 'react-native'

/**
 * ⚡ Componente de Imagen Optimizada
 * - Caché automático
 * - Loading state
 * - Fallback en caso de error
 */
interface OptimizedImageProps extends ImageProps {
  fallbackSource?: any
  showLoader?: boolean
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  fallbackSource,
  showLoader = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoadStart = () => {
    setLoading(true)
    setError(false)
  }

  const handleLoadEnd = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  const imageSource = error && fallbackSource ? fallbackSource : source

  return (
    <View style={[style, styles.container]}>
      <Image
        {...props}
        source={imageSource}
        style={[style, styles.image]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        // ⚡ OPTIMIZACIÓN: Caché de imágenes
        resizeMode={props.resizeMode || 'cover'}
        defaultSource={fallbackSource}
      />
      {loading && showLoader && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
})
