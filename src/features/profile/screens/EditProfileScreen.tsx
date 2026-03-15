import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useGetMyProfileQuery, useUpdateProfileMutation } from '../../../api/membersApi';
import Toast from 'react-native-toast-message';

const schema = z.object({
  mobileNo: z.string().regex(/^\+91\d{10}$/, 'Enter valid mobile: +91XXXXXXXXXX').optional().or(z.literal('')),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { data: profile } = useGetMyProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mobileNo: profile?.mobileNo ?? '',
      maritalStatus: profile?.maritalStatus?.toLowerCase() as FormData['maritalStatus'],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && v !== undefined));
      await updateProfile(payload).unwrap();
      Toast.show({ type: 'success', text1: 'Profile updated successfully!' });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: err?.data?.message });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
          Update your personal information below. Employee ID and designation are managed by admin.
        </Text>

        {/* Mobile */}
        <Controller control={control} name="mobileNo" render={({ field: { onChange, value } }) => (
          <TextInput label="Mobile Number" value={value} onChangeText={onChange} mode="outlined"
            keyboardType="phone-pad" placeholder="+91XXXXXXXXXX"
            left={<TextInput.Icon icon="phone" />}
            error={!!errors.mobileNo} style={styles.input} />
        )} />
        <HelperText type="error" visible={!!errors.mobileNo}>{errors.mobileNo?.message}</HelperText>

        {/* Marital Status */}
        <Text variant="bodySmall" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
          Marital Status
        </Text>
        <Controller control={control} name="maritalStatus" render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value ?? ''}
            onValueChange={onChange}
            buttons={[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' },
            ]}
          />
        )} />

        <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isLoading}
          disabled={isLoading} style={styles.saveBtn} contentStyle={styles.saveBtnContent}>
          Save Changes
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  input: { marginBottom: 2 },
  fieldLabel: { marginTop: 12, marginBottom: 8 },
  saveBtn: { marginTop: 24, borderRadius: 8 },
  saveBtnContent: { height: 48 },
});
