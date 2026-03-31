import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation }     from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { z }                 from 'zod'
import { Ionicons }          from '@expo/vector-icons'
import { Input }             from '@/components/common/Input'
import { Button }            from '@/components/common/Button'
import { useForgotPassword } from '@/hooks/useAuth'
import T from '@/theme'

const schema = z.object({ email: z.string().email('Please enter a valid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const forgot     = useForgotPassword()
  const [sent, setSent] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    forgot.mutate(data.email, { onSuccess: () => setSent(true) })
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <Ionicons name="mail" size={40} color="#6366F1" />
      </View>

      <Text style={styles.heading}>Forgot password?</Text>
      <Text style={styles.sub}>Enter your email and we'll send you a reset link</Text>

      {sent ? (
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
          <Text style={styles.successTitle}>Email sent!</Text>
          <Text style={styles.successText}>Check your inbox for a password reset link.</Text>
          <Button title="Back to login" onPress={() => navigation.navigate('Login')}
            variant="outline" size="sm" style={{ marginTop: 16 }} />
        </View>
      ) : (
        <>
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Email address" placeholder="you@example.com" leftIcon="mail-outline"
              keyboardType="email-address" autoCapitalize="none"
              onChangeText={onChange} value={value} error={errors.email?.message} />
          )} />
          <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)}
            loading={forgot.isPending} fullWidth size="lg" />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: T.surface },
  content:      { paddingHorizontal: 24 },
  backBtn:      { marginBottom: 32 },
  iconWrap:     { width: 80, height: 80, borderRadius: 24, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  heading:      { fontSize: 26, fontWeight: '800', color: T.text, marginBottom: 8 },
  sub:          { fontSize: 15, color: T.muted, marginBottom: 28, lineHeight: 22 },
  successCard:  { alignItems: 'center', padding: 24, backgroundColor: T.surface2, borderRadius: 16 },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#15803D', marginTop: 12, marginBottom: 8 },
  successText:  { fontSize: 14, color: '#166534', textAlign: 'center' },
})
