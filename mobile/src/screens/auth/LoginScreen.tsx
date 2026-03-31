import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import { Input }  from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useLogin, useGoogleOAuth } from '@/hooks/useAuth'
import T from '@/theme'

const schema = z.object({
  identifier: z.string().min(1, 'Please enter your email or username'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function LoginScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const login      = useLogin()
  const { startOAuth } = useGoogleOAuth()

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => login.mutate(data)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Brand */}
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Ionicons name="sparkles" size={28} color={T.white} />
          </View>
          <Text style={styles.brandName}>Bobo</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to continue learning</Text>

        {/* Google OAuth */}
        <TouchableOpacity style={styles.googleBtn} onPress={startOAuth} activeOpacity={0.8}>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

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
            <Ionicons name="alert-circle" size={16} color={T.red} />
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll:          { flex: 1, backgroundColor: T.bg },
  content:         { paddingHorizontal: 24 },
  brandRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  logoBox:         { width: 48, height: 48, borderRadius: 14, backgroundColor: T.primary2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  brandName:       { fontSize: 24, fontWeight: '800', color: T.text },
  heading:         { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 8 },
  subheading:      { fontSize: 15, color: T.muted, marginBottom: 28 },
  googleBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.border2, borderRadius: 12, padding: 14, marginBottom: 20, backgroundColor: T.surface2 },
  googleText:      { fontSize: 15, fontWeight: '600', color: T.text, marginLeft: 10 },
  divider:         { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine:     { flex: 1, height: 1, backgroundColor: T.border2 },
  dividerText:     { paddingHorizontal: 12, fontSize: 13, color: T.muted2 },
  forgotBtn:       { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText:      { fontSize: 13, fontWeight: '600', color: T.primary },
  errorBanner:     { flexDirection: 'row', alignItems: 'center', backgroundColor: `${T.red}22`, borderWidth: 1, borderColor: `${T.red}44`, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorBannerText: { fontSize: 13, color: T.red, marginLeft: 8, flex: 1 },
  submitBtn:       { marginTop: 4 },
  registerRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText:    { fontSize: 14, color: T.muted },
  registerLink:    { fontSize: 14, fontWeight: '700', color: T.primary },
})
