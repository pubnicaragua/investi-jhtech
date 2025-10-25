import React from 'react'
import Svg, { Path, Circle, Rect, G } from 'react-native-svg'

// Facebook Logo
export const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#1877F2" />
    <Path
      d="M16.5 12.75H13.5V21H10.5V12.75H8.25V10.125H10.5V8.25C10.5 6.18 11.805 4.5 14.25 4.5H16.5V7.125H14.625C14.0625 7.125 13.5 7.5 13.5 8.25V10.125H16.5V12.75Z"
      fill="white"
    />
  </Svg>
)

// Google Logo
export const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
)

// LinkedIn Logo
export const LinkedInIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect width="24" height="24" rx="4" fill="#0A66C2" />
    <Path
      d="M7.5 9.5H5V18.5H7.5V9.5Z"
      fill="white"
    />
    <Path
      d="M6.25 8.25C7.07843 8.25 7.75 7.57843 7.75 6.75C7.75 5.92157 7.07843 5.25 6.25 5.25C5.42157 5.25 4.75 5.92157 4.75 6.75C4.75 7.57843 5.42157 8.25 6.25 8.25Z"
      fill="white"
    />
    <Path
      d="M13.5 13.5C13.5 12.5 14 11.5 15.5 11.5C17 11.5 17.5 12.5 17.5 13.5V18.5H20V13C20 10 18.5 9 16.5 9C15 9 14 9.5 13.5 10.5V9.5H11V18.5H13.5V13.5Z"
      fill="white"
    />
  </Svg>
)
