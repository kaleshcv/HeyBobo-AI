import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import T from '@/theme'

interface AppHeaderProps {
  title:         string
  subtitle?:     string
  showBack?:     boolean
  rightAction?:  React.ReactNode
  onBack?:       () => void
  transparent?:  boolean
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  onBack,
  transparent = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const handleBack = () => (onBack ? onBack() : navigation.goBack())

  return (
    <View style={[
      styles.header,
      transparent && styles.transparent,
      { paddingTop: insets.top + 8 },
    ]}>
      <View style={styles.row}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={T.text} />
          </TouchableOpacity>
        )}

        <View style={[styles.titleWrap, !showBack && styles.titleFull]}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>

        {rightAction ? (
          <View style={styles.right}>{rightAction}</View>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor:   T.bg2,
    paddingHorizontal: 16,
    paddingBottom:     12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  transparent: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  row:         { flexDirection: 'row', alignItems: 'center' },
  backBtn:     { padding: 4, marginRight: 8 },
  titleWrap:   { flex: 1 },
  titleFull:   { marginLeft: 4 },
  title:       { fontSize: 18, fontWeight: '700', color: T.text },
  subtitle:    { fontSize: 13, color: T.muted, marginTop: 1 },
  right:       { marginLeft: 8 },
  rightPlaceholder: { width: 32 },
})
