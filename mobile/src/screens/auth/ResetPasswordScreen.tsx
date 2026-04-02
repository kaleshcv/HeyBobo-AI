import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useForm, Controller }  from 'react-hook-form'
import { zodResolver }          from '@hookform/resolvers/zod'
import { z }                    from 'zod'
import { Input }                from '@/components/common/Input'
import { Button }               from '@/components/common/Button'
import { useResetPassword }     from '@/hooks/useAuth'
import T from '@/theme'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export function ResetPasswordScreen() {
  const insets  = useSafeAreaInsets()
  const route   = useRoute<any>()
  const nav     = useNavigation<any>()
  const reset   = useResetPassword()
  const token   = route.params?.token as string

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    reset.mutate({ token, password: data.password }, {
      onSuccess: () => nav.navigate('Login'),
    })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.surface }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: 40 }]}
    >
      <Text style={styles.heading}>Set new password</Text>
      <Text style={styles.sub}>Choose a strong password for your account</Text>

      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <Input label="New password" placeholder="At least 8 characters" leftIcon="lock-closed-outline"
          secureTextEntry onChangeText={onChange} value={value} error={errors.password?.message} />
      )} />

      <Controller control={control} name="confirm" render={({ field: { onChange, value } }) => (
        <Input label="Confirm password" placeholder="Repeat password" leftIcon="lock-closed-outline"
          secureTextEntry onChangeText={onChange} value={value} error={errors.confirm?.message} />
      )} />

      {reset.isError && <Text style={styles.err}>Reset failed. The link may have expired.</Text>}

      <Button title="Reset Password" onPress={handleSubmit(onSubmit)}
        loading={reset.isPending} fullWidth size="lg" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24 },
  heading: { fontSize: 26, fontWeight: '800', color: T.text, marginBottom: 8 },
  sub:     { fontSize: 15, color: T.muted, marginBottom: 28 },
  err:     { fontSize: 13, color: T.red, marginBottom: 12 },
})
