import React from 'react'
import { View, StyleSheet, type ViewProps } from 'react-native'

const PADDING_MAP: Record<string, number> = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 }

interface CardProps extends ViewProps {
  padding?: number | string
  shadow?:  boolean
}

export function Card({ style, padding = 16, shadow = true, children, ...rest }: CardProps) {
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
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     '#F1F5F9',
  },
  shadow: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  8,
    elevation:     3,
  },
})
