import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChangePinMutation } from '../../../api/authApi';
import { useAppDispatch } from '../../../store';
import { pinChanged } from '../../../store/slices/authSlice';
import Toast from 'react-native-toast-message';

const schema = z.object({
  currentPin: z.string().min(4, 'Current PIN is required'),
  newPin: z.string().min(4, 'PIN must be at least 4 digits').max(6, 'PIN max 6 digits'),
  confirmPin: z.string().min(4),
}).refine((d) => d.newPin === d.confirmPin, {
  message: 'PINs do not match',
  path: ['confirmPin'],
});

type FormData = z.infer<typeof schema>;

export default function ChangePinScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [changePin, { isLoading }] = useChangePinMutation();
  const [visible, setVisible] = useState({ current: false, newPin: false, confirm: false });

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await changePin({ currentPin: data.currentPin, newPin: data.newPin }).unwrap();
      dispatch(pinChanged());
      Toast.show({ type: 'success', text1: 'PIN changed successfully!' });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to change PIN',
        text2: err?.data?.message ?? 'Please try again.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={{ fontSize: 36 }}>🔐</Text>
          </View>
        </View>

        <Text variant="headlineSmall" style={styles.title}>Change Your PIN</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 32 }}>
          You must set a new PIN before continuing.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Current PIN */}
          <Controller control={control} name="currentPin" render={({ field: { onChange, value } }) => (
            <TextInput label="Current PIN" value={value} onChangeText={onChange} mode="outlined"
              keyboardType="numeric" secureTextEntry={!visible.current}
              right={<TextInput.Icon icon={visible.current ? 'eye-off' : 'eye'} onPress={() => setVisible(v => ({ ...v, current: !v.current }))} />}
              error={!!errors.currentPin} style={styles.input} />
          )} />
          <HelperText type="error" visible={!!errors.currentPin}>{errors.currentPin?.message}</HelperText>

          {/* New PIN */}
          <Controller control={control} name="newPin" render={({ field: { onChange, value } }) => (
            <TextInput label="New PIN" value={value} onChangeText={onChange} mode="outlined"
              keyboardType="numeric" secureTextEntry={!visible.newPin}
              right={<TextInput.Icon icon={visible.newPin ? 'eye-off' : 'eye'} onPress={() => setVisible(v => ({ ...v, newPin: !v.newPin }))} />}
              error={!!errors.newPin} style={styles.input} />
          )} />
          <HelperText type="error" visible={!!errors.newPin}>{errors.newPin?.message}</HelperText>

          {/* Confirm PIN */}
          <Controller control={control} name="confirmPin" render={({ field: { onChange, value } }) => (
            <TextInput label="Confirm New PIN" value={value} onChangeText={onChange} mode="outlined"
              keyboardType="numeric" secureTextEntry={!visible.confirm}
              right={<TextInput.Icon icon={visible.confirm ? 'eye-off' : 'eye'} onPress={() => setVisible(v => ({ ...v, confirm: !v.confirm }))} />}
              error={!!errors.confirmPin} style={styles.input} />
          )} />
          <HelperText type="error" visible={!!errors.confirmPin}>{errors.confirmPin?.message}</HelperText>

          <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isLoading}
            disabled={isLoading} style={styles.button} contentStyle={styles.buttonContent}>
            Set New PIN
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  title: { textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  card: { borderRadius: 16, padding: 24, elevation: 2 },
  input: { marginBottom: 2 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { height: 48 },
});
