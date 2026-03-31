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

interface InputProps extends TextInputProps {
  label?:        string
  error?:        string
  hint?:         string
  leftIcon?:     string
  rightIcon?:    string
  onRightIconPress?: () => void
  containerStyle?: object
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
  style,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = secureTextEntry

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputRow,
        isFocused && styles.focused,
        !!error    && styles.errored,
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={18}
            color={error ? T.red : isFocused ? T.primary : T.muted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={T.muted2}
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
              color={T.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
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
