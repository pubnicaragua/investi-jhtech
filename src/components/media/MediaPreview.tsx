import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { X, Video as VideoIcon } from 'lucide-react-native'

export interface MediaItem {
  id: string
  uri: string
  type: 'image' | 'video'
  name?: string
  size?: number
  mimeType?: string
  uploadProgress?: number
  uploadError?: string
}

interface MediaPreviewProps {
  items: MediaItem[]
  onRemove: (id: string) => void
  onRetry?: (id: string) => void
}

export function MediaPreview({ items, onRemove, onRetry }: MediaPreviewProps) {
  if (items.length === 0) return null

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderMediaItem = (item: MediaItem) => {
    const isUploading = item.uploadProgress !== undefined && item.uploadProgress < 100
    const hasError = !!item.uploadError

    return (
      <View key={item.id} style={styles.mediaItem}>
        {/* Media Content */}
        <View style={styles.mediaContent}>
          {item.type === 'image' && (
            <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
          )}
          
          {item.type === 'video' && (
            <View style={[styles.mediaImage, styles.videoPlaceholder]}>
              <VideoIcon size={32} color="#FFFFFF" />
            </View>
          )}

          {/* Upload Progress Overlay */}
          {isUploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.uploadProgress}>{item.uploadProgress}%</Text>
            </View>
          )}

          {/* Error Overlay */}
          {hasError && (
            <View style={[styles.uploadOverlay, styles.errorOverlay]}>
              <Text style={styles.errorText}>Error</Text>
              {onRetry && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => onRetry(item.id)}
                  accessibilityLabel="Reintentar subida"
                  accessibilityRole="button"
                >
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item.id)}
          accessibilityLabel="Eliminar archivo"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* File Info */}
        {item.size && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map(renderMediaItem)}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  mediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  mediaContent: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  errorOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fileInfo: {
    marginTop: 4,
    alignItems: 'center',
  },
  fileSize: {
    fontSize: 10,
    color: '#9CA3AF',
  },
})
