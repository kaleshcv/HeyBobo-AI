import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import T from '@/theme'

interface EmptyStateProps {
  icon?:        string
  title:        string
  description?: string
  action?:      { label: string; onPress: () => void }
}

export function EmptyState({ icon = 'cube-outline', title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={40} color={T.muted2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {action && (
        <Button title={action.label} onPress={action.onPress} size="sm" style={{ marginTop: 16 }} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap:  {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: T.surface2,
    borderWidth: 1, borderColor: T.border2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', color: T.text,  marginBottom: 8, textAlign: 'center' },
  desc:  { fontSize: 14, color: T.muted,  textAlign: 'center', lineHeight: 22 },
})
