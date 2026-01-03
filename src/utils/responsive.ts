/**
 * ============================================================================
 * RESPONSIVE UTILITIES FOR WEB
 * ============================================================================
 * 
 * Utilidades para hacer la app responsive en web
 * - Detecta plataforma (web vs mobile)
 * - Breakpoints para diferentes tamaños
 * - Hooks para dimensiones reactivas
 * - Helpers para estilos condicionales
 */

import { Dimensions, Platform } from 'react-native'
import { useEffect, useState } from 'react'

// ============================================================================
// CONSTANTS
// ============================================================================

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const

export const MAX_WIDTHS = {
  mobile: '100%',
  tablet: 900,
  desktop: 1200,
  wide: 1400,
} as const

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

export const isWeb = Platform.OS === 'web'
export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
export const isMobileOS = isIOS || isAndroid

// ============================================================================
// DIMENSION HELPERS
// ============================================================================

/**
 * Obtiene las dimensiones actuales de la ventana
 */
export const getDimensions = () => {
  return Dimensions.get('window')
}

/**
 * Verifica si el ancho actual es móvil
 */
export const isMobileWidth = () => {
  return getDimensions().width < BREAKPOINTS.tablet
}

/**
 * Verifica si el ancho actual es tablet
 */
export const isTabletWidth = () => {
  const width = getDimensions().width
  return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop
}

/**
 * Verifica si el ancho actual es desktop
 */
export const isDesktopWidth = () => {
  return getDimensions().width >= BREAKPOINTS.desktop
}

/**
 * Verifica si el ancho actual es wide (pantallas grandes)
 */
export const isWideWidth = () => {
  return getDimensions().width >= BREAKPOINTS.wide
}

// ============================================================================
// RESPONSIVE WIDTH HELPERS
// ============================================================================

/**
 * Obtiene el ancho responsivo basado en el tamaño de pantalla
 */
export const getResponsiveWidth = (): string | number => {
  const width = getDimensions().width
  
  if (width >= BREAKPOINTS.wide) return '60%'
  if (width >= BREAKPOINTS.desktop) return '70%'
  if (width >= BREAKPOINTS.tablet) return '85%'
  return '100%'
}

/**
 * Obtiene el ancho máximo basado en el tamaño de pantalla
 */
export const getMaxWidth = (): string | number => {
  const width = getDimensions().width
  
  if (width >= BREAKPOINTS.wide) return MAX_WIDTHS.wide
  if (width >= BREAKPOINTS.desktop) return MAX_WIDTHS.desktop
  if (width >= BREAKPOINTS.tablet) return MAX_WIDTHS.tablet
  return MAX_WIDTHS.mobile
}

/**
 * Obtiene padding responsivo
 */
export const getResponsivePadding = () => {
  const width = getDimensions().width
  
  if (width >= BREAKPOINTS.desktop) return 24
  if (width >= BREAKPOINTS.tablet) return 20
  return 16
}

/**
 * Obtiene el número de columnas para grids
 */
export const getGridColumns = () => {
  const width = getDimensions().width
  
  if (width >= BREAKPOINTS.wide) return 4
  if (width >= BREAKPOINTS.desktop) return 3
  if (width >= BREAKPOINTS.tablet) return 2
  return 1
}

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================

export interface ResponsiveInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  width: number
  height: number
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide'
}

/**
 * Hook para obtener información responsive reactiva
 * Se actualiza automáticamente cuando cambia el tamaño de la ventana
 */
export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(getDimensions())
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })
    
    return () => subscription?.remove()
  }, [])
  
  const width = dimensions.width
  const isMobile = width < BREAKPOINTS.tablet
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop
  const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.wide
  const isWide = width >= BREAKPOINTS.wide
  
  let breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide' = 'mobile'
  if (isWide) breakpoint = 'wide'
  else if (isDesktop) breakpoint = 'desktop'
  else if (isTablet) breakpoint = 'tablet'
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
  }
}

// ============================================================================
// STYLE HELPERS
// ============================================================================

/**
 * Genera estilos de contenedor responsive
 */
export const getResponsiveContainerStyle = () => {
  if (!isWeb) return {}
  
  return {
    maxWidth: getMaxWidth(),
    width: '100%',
    alignSelf: 'center' as const,
    paddingHorizontal: getResponsivePadding(),
  }
}

/**
 * Genera estilos de card responsive
 */
export const getResponsiveCardStyle = () => {
  const width = getDimensions().width
  
  return {
    width: width >= BREAKPOINTS.desktop ? '48%' : '100%',
    marginBottom: 16,
  }
}

/**
 * Aplica estilos solo en web
 */
export const webOnly = (styles: any) => {
  return isWeb ? styles : {}
}

/**
 * Aplica estilos solo en mobile
 */
export const mobileOnly = (styles: any) => {
  return isMobileOS ? styles : {}
}

/**
 * Aplica estilos condicionalmente según el breakpoint
 */
export const responsiveStyle = (styles: {
  mobile?: any
  tablet?: any
  desktop?: any
  wide?: any
}) => {
  const width = getDimensions().width
  
  if (width >= BREAKPOINTS.wide && styles.wide) return styles.wide
  if (width >= BREAKPOINTS.desktop && styles.desktop) return styles.desktop
  if (width >= BREAKPOINTS.tablet && styles.tablet) return styles.tablet
  return styles.mobile || {}
}

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Determina si debe usar layout de sidebar (desktop) o bottom tabs (mobile)
 */
export const shouldUseSidebar = () => {
  return isWeb && isDesktopWidth()
}

/**
 * Determina si debe mostrar dos columnas
 */
export const shouldUseTwoColumns = () => {
  return getDimensions().width >= BREAKPOINTS.tablet
}

/**
 * Calcula el ancho de columna para layouts multi-columna
 */
export const getColumnWidth = (columns: number = 2, gap: number = 16) => {
  const containerWidth = getDimensions().width
  const maxWidth = typeof getMaxWidth() === 'number' ? getMaxWidth() as number : containerWidth
  const padding = getResponsivePadding() * 2
  const totalGap = gap * (columns - 1)
  
  return (Math.min(containerWidth, maxWidth) - padding - totalGap) / columns
}

// ============================================================================
// FONT SIZE HELPERS
// ============================================================================

/**
 * Obtiene tamaño de fuente responsive
 */
export const getResponsiveFontSize = (base: number) => {
  const width = getDimensions().width
  
  if (width >= BREAKPOINTS.desktop) return base * 1.1
  if (width >= BREAKPOINTS.tablet) return base * 1.05
  return base
}

/**
 * Tamaños de fuente predefinidos
 */
export const FONT_SIZES = {
  xs: getResponsiveFontSize(12),
  sm: getResponsiveFontSize(14),
  base: getResponsiveFontSize(16),
  lg: getResponsiveFontSize(18),
  xl: getResponsiveFontSize(20),
  '2xl': getResponsiveFontSize(24),
  '3xl': getResponsiveFontSize(30),
  '4xl': getResponsiveFontSize(36),
}

// ============================================================================
// ORIENTATION HELPERS
// ============================================================================

/**
 * Verifica si está en modo landscape
 */
export const isLandscape = () => {
  const { width, height } = getDimensions()
  return width > height
}

/**
 * Verifica si está en modo portrait
 */
export const isPortrait = () => {
  return !isLandscape()
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Constants
  BREAKPOINTS,
  MAX_WIDTHS,
  FONT_SIZES,
  
  // Platform
  isWeb,
  isIOS,
  isAndroid,
  isMobileOS,
  
  // Dimensions
  getDimensions,
  isMobileWidth,
  isTabletWidth,
  isDesktopWidth,
  isWideWidth,
  
  // Responsive
  getResponsiveWidth,
  getMaxWidth,
  getResponsivePadding,
  getGridColumns,
  useResponsive,
  
  // Styles
  getResponsiveContainerStyle,
  getResponsiveCardStyle,
  webOnly,
  mobileOnly,
  responsiveStyle,
  
  // Layout
  shouldUseSidebar,
  shouldUseTwoColumns,
  getColumnWidth,
  
  // Font
  getResponsiveFontSize,
  
  // Orientation
  isLandscape,
  isPortrait,
}
