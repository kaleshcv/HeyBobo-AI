import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import T from '@/theme'

/** Light-mode palette for screens that override the dark theme */
const LIGHT = {
  bg:      '#f8fafc',
  border:  '#e2e8f0',
  text:    '#0f172a',
  text2:   '#334155',
  muted:   '#64748b',
  muted2:  '#94a3b8',
  primary: T.primary2,
  red:     T.red,
} as const

interface InputProps extends TextInputProps {
  label?:        string
  error?:        string
  hint?:         string
  leftIcon?:     string
  rightIcon?:    string
  onRightIconPress?: () => void
  containerStyle?: object
  /** Force light-mode colours (e.g. on the login screen) */
  lightMode?:    boolean
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  lightMode = false,
  style,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = secureTextEntry

  /* Resolve palette once */
  const c = lightMode ? LIGHT : { bg: T.surface2, border: T.border2, text: T.text, text2: T.text2, muted: T.muted, muted2: T.muted2, primary: T.primary, red: T.red }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, lightMode && { color: c.text2 }]}>{label}</Text>}

      <View style={[
        styles.inputRow,
        lightMode && { backgroundColor: c.bg, borderColor: c.border },
        isFocused && (lightMode ? { borderColor: c.primary } : styles.focused),
        !!error    && styles.errored,
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={18}
            color={error ? c.red : isFocused ? c.primary : c.muted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, lightMode && { color: c.text }, style]}
          placeholderTextColor={c.muted2}
          secureTextEntry={isPassword ? !showPassword : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {(isPassword || rightIcon) && (
          <TouchableOpacity
            onPress={isPassword ? () => setShowPassword(!showPassword) : onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={(isPassword
                ? showPassword ? 'eye-off' : 'eye'
                : rightIcon) as any}
              size={18}
              color={c.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={[styles.error, lightMode && { color: c.red }]}>{error}</Text>}
      {hint && !error && <Text style={[styles.hint, lightMode && { color: c.muted }]}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper:   { marginBottom: 16 },
  label:     { fontSize: 14, fontWeight: '600', color: T.text2, marginBottom: 6 },
  inputRow:  {
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1.5,
    borderColor:       T.border2,
    borderRadius:      12,
    backgroundColor:   T.surface2,
    paddingHorizontal: 14,
    minHeight:         52,
  },
  focused:  { borderColor: T.primary, backgroundColor: T.surface2 },
  errored:  { borderColor: T.red },
  input: {
    flex:            1,
    fontSize:        15,
    color:           T.text,
    paddingVertical: 12,
  },
  leftIcon:  { marginRight: 10 },
  rightIcon: { padding: 4 },
  error:     { fontSize: 12, color: T.red,  marginTop: 4 },
  hint:      { fontSize: 12, color: T.muted, marginTop: 4 },
})
