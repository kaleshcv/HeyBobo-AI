import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Image, StatusBar,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import { Input }  from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useLogin } from '@/hooks/useAuth'
import T from '@/theme'

/* ── Light-mode overrides (login is always light) ── */
const L = {
  bg:       '#ffffff',
  surface:  '#f8fafc',
  surface2: '#f1f5f9',
  text:     '#0f172a',
  muted:    '#64748b',
  border2:  '#e2e8f0',
  primary:  T.primary2,   // keep brand colour
  red:      T.red,
} as const

const schema = z.object({
  identifier: z.string().min(1, 'Please enter your email or username'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function LoginScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const login      = useLogin()
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => login.mutate(data)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: L.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={L.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to continue learning</Text>

        {/* Form */}
        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.identifier?.message}
              lightMode
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Password"
              placeholder="••••••••"
              leftIcon="lock-closed-outline"
              secureTextEntry
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
              lightMode
            />
          )}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {login.isError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={L.red} />
            <Text style={styles.errorBannerText}>
              {(() => {
                const err = login.error as any
                if (!err?.response) {
                  const url = err?.config?.baseURL ?? 'unknown'
                  const code = err?.code ?? 'UNKNOWN'
                  const msg = err?.message ?? ''
                  return `Network error [${code}]: ${msg}\nURL: ${url}`
                }
                const msg = err?.response?.data?.message
                if (Array.isArray(msg)) return msg.join('. ')
                return msg ?? `Error ${err?.response?.status}: Invalid email or password`
              })()}
            </Text>
          </View>
        )}

        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
          fullWidth
          size="lg"
          style={styles.submitBtn}
        />

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot */}
        <View style={styles.mascotContainer}>
          <Image
            source={require('@/assets/images/bobo-mascot.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll:          { flex: 1, backgroundColor: L.bg },
  content:         { paddingHorizontal: 24 },
  brandRow:        { alignItems: 'center', marginBottom: 32 },
  logoImage:       { width: 90, height: 90 },
  heading:         { fontSize: 28, fontWeight: '800', color: L.text, marginBottom: 8 },
  subheading:      { fontSize: 15, color: L.muted, marginBottom: 28 },
  forgotBtn:       { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText:      { fontSize: 13, fontWeight: '600', color: L.primary },
  errorBanner:     { flexDirection: 'row', alignItems: 'center', backgroundColor: `${L.red}22`, borderWidth: 1, borderColor: `${L.red}44`, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorBannerText: { fontSize: 13, color: L.red, marginLeft: 8, flex: 1 },
  submitBtn:       { marginTop: 4 },
  registerRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText:    { fontSize: 14, color: L.muted },
  registerLink:    { fontSize: 14, fontWeight: '700', color: L.primary },
  mascotContainer: { alignItems: 'center', marginTop: 32 },
  mascotImage:     { width: 200, height: 200 },
})
