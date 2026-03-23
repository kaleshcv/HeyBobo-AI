import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'

interface EmptyStateProps {
  icon?:      string
  title:      string
  description?: string
  action?:    { label: string; onPress: () => void }
}

export function EmptyState({ icon = 'cube-outline', title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={48} color="#CBD5E1" />
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
  iconWrap:  { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  desc:      { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
})
