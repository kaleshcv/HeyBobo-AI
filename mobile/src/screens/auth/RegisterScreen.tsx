import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation }     from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { z }                 from 'zod'
import { Ionicons }          from '@expo/vector-icons'
import { Input }             from '@/components/common/Input'
import { Button }            from '@/components/common/Button'
import { useRegister }       from '@/hooks/useAuth'
import { UserRole }          from '@/types'

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName:  z.string().min(2, 'Last name is required'),
  email:     z.string().email('Please enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role:      z.enum([UserRole.STUDENT, UserRole.TEACHER]),
})
type FormData = z.infer<typeof schema>

export function RegisterScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const register   = useRegister()

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: UserRole.STUDENT },
  })

  const selectedRole = watch('role')

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Start your learning journey today</Text>

        {/* Role picker */}
        <Text style={styles.roleLabel}>I want to</Text>
        <View style={styles.roleRow}>
          {[
            { role: UserRole.STUDENT, label: 'Learn', icon: 'book-outline' },
            { role: UserRole.TEACHER, label: 'Teach', icon: 'school-outline' },
          ].map(({ role, label, icon }) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleCard, selectedRole === role && styles.roleCardActive]}
              onPress={() => setValue('role', role as UserRole.STUDENT | UserRole.TEACHER)}
            >
              <Ionicons name={icon as any} size={22} color={selectedRole === role ? '#6366F1' : '#94A3B8'} />
              <Text style={[styles.roleCardText, selectedRole === role && styles.roleCardTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.nameRow}>
          <Controller control={control} name="firstName" render={({ field: { onChange, value } }) => (
            <Input label="First name" placeholder="Jane" onChangeText={onChange} value={value}
              error={errors.firstName?.message} containerStyle={{ flex: 1, marginRight: 8, marginBottom: 0 }} />
          )} />
          <Controller control={control} name="lastName" render={({ field: { onChange, value } }) => (
            <Input label="Last name" placeholder="Smith" onChangeText={onChange} value={value}
              error={errors.lastName?.message} containerStyle={{ flex: 1, marginBottom: 0 }} />
          )} />
        </View>

        <View style={{ height: 16 }} />

        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <Input label="Email" placeholder="you@example.com" leftIcon="mail-outline"
            keyboardType="email-address" autoCapitalize="none"
            onChangeText={onChange} value={value} error={errors.email?.message} />
        )} />

        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <Input label="Password" placeholder="At least 8 characters" leftIcon="lock-closed-outline"
            secureTextEntry onChangeText={onChange} value={value} error={errors.password?.message}
            hint="Mix uppercase, numbers and symbols for a strong password" />
        )} />

        {register.isError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {(register.error as any)?.response?.data?.message ?? 'Registration failed. Try again.'}
            </Text>
          </View>
        )}

        <Button title="Create Account" onPress={handleSubmit((d) => register.mutate(d))}
          loading={register.isPending} fullWidth size="lg" style={{ marginTop: 8 }} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: '#FFFFFF' },
  content:      { paddingHorizontal: 24 },
  backBtn:      { marginBottom: 24 },
  heading:      { fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  sub:          { fontSize: 15, color: '#64748B', marginBottom: 24 },
  roleLabel:    { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  roleRow:      { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleCard:     { flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 },
  roleCardActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  roleCardText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  roleCardTextActive: { color: '#6366F1' },
  nameRow:      { flexDirection: 'row' },
  errorBanner:  { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText:    { fontSize: 13, color: '#EF4444' },
  loginRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText:    { fontSize: 14, color: '#64748B' },
  loginLink:    { fontSize: 14, fontWeight: '700', color: '#6366F1' },
})
