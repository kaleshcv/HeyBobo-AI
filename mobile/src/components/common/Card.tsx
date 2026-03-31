import React from 'react'
import { View, StyleSheet, type ViewProps } from 'react-native'
import T from '@/theme'

const PADDING_MAP: Record<string, number> = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 }

interface CardProps extends ViewProps {
  padding?: number | string
  shadow?:  boolean
}

export function Card({ style, padding = 16, shadow = false, children, ...rest }: CardProps) {
  const resolvedPadding = typeof padding === 'string' ? (PADDING_MAP[padding] ?? 16) : padding
  return (
    <View
      style={[
        styles.base,
        shadow && styles.shadow,
        { padding: resolvedPadding },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: T.surface,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     T.border,
  },
  shadow: {
    shadowColor:   T.black,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  12,
    elevation:     6,
  },
})
