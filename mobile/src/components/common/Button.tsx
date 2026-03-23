import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type TouchableOpacityProps,
} from 'react-native'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends TouchableOpacityProps {
  title:      string
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  icon?:      React.ReactNode
  iconRight?: boolean
  fullWidth?: boolean
}

const BG: Record<Variant, string> = {
  primary:     '#6366F1',
  secondary:   '#F1F5F9',
  outline:     'transparent',
  ghost:       'transparent',
  destructive: '#EF4444',
}

const TEXT: Record<Variant, string> = {
  primary:     '#FFFFFF',
  secondary:   '#1E293B',
  outline:     '#6366F1',
  ghost:       '#6366F1',
  destructive: '#FFFFFF',
}

const BORDER: Record<Variant, string> = {
  primary:     'transparent',
  secondary:   'transparent',
  outline:     '#6366F1',
  ghost:       'transparent',
  destructive: 'transparent',
}

const PADDING: Record<Size, { paddingVertical: number; paddingHorizontal: number }> = {
  sm: { paddingVertical: 8,  paddingHorizontal: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 28 },
}

const FONT: Record<Size, number> = { sm: 13, md: 15, lg: 17 }

export function Button({
  title,
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon,
  iconRight = false,
  fullWidth = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        PADDING[size],
        {
          backgroundColor: BG[variant],
          borderColor:     BORDER[variant],
          borderWidth:     variant === 'outline' ? 1.5 : 0,
          opacity:         isDisabled ? 0.5 : 1,
          alignSelf:       fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={TEXT[variant]} />
      ) : (
        <View style={styles.content}>
          {icon && !iconRight && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, { color: TEXT[variant], fontSize: FONT[size] }]}>
            {title}
          </Text>
          {icon && iconRight && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft:  8 },
})
