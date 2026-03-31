import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import T from '@/theme'

interface AvatarProps {
  uri?:    string
  name?:   string
  size?:   number | string
  color?:  string
}

const SIZE_MAP: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 }

const COLORS = [T.primary2, '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6']

function colorFromName(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function Avatar({ uri, name = '', size = 40, color }: AvatarProps) {
  const resolvedSize = typeof size === 'string' ? (SIZE_MAP[size] ?? 40) : size
  const bg = color ?? colorFromName(name)
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <View style={[styles.base, { width: resolvedSize, height: resolvedSize, borderRadius: resolvedSize / 2, backgroundColor: bg }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: resolvedSize, height: resolvedSize, borderRadius: resolvedSize / 2 }}
          contentFit="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize: resolvedSize * 0.36 }]}>{initials}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base:     { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { color: T.surface, fontWeight: '700' },
})
