import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { useLoginMutation } from '../../../api/authApi';
import { useAppDispatch } from '../../../store';
import { setCredentials } from '../../../store/slices/authSlice';
import { tokenStorage } from '../../../utils/storage';
import Toast from 'react-native-toast-message';

const schema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  pin: z.string().min(4, 'PIN must be at least 4 digits').max(6),
});

type FormData = z.infer<typeof schema>;

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [pinVisible, setPinVisible] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data).unwrap();
      tokenStorage.setToken(result.accessToken);
      tokenStorage.setUser({
        userId: '',
        role: result.role,
        employeeId: result.employeeId,
        requiresPinChange: result.requiresPinChange,
      });
      dispatch(setCredentials({
        token: result.accessToken,
        user: {
          userId: '',
          role: result.role,
          employeeId: result.employeeId,
          requiresPinChange: result.requiresPinChange,
        },
      }));
      if (result.requiresPinChange) {
        navigation.navigate('ChangePin');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err?.data?.message ?? 'Invalid credentials. Please try again.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Red header section matching logo */}
      <View style={[styles.heroSection, { backgroundColor: theme.colors.primary }]}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.appName}>
          Union Portal
        </Text>
        <View style={[styles.navyBadge, { backgroundColor: theme.colors.secondary }]}>
          <Text style={styles.navyBadgeText}>
            TEE 1104' UNION
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.cardTitle}>Welcome back</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
            Sign in with your Employee ID and PIN
          </Text>

          {/* Employee ID */}
          <Controller
            control={control}
            name="employeeId"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Employee ID"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                autoCapitalize="characters"
                left={<TextInput.Icon icon="badge-account-outline" />}
                error={!!errors.employeeId}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.employeeId}>
            {errors.employeeId?.message}
          </HelperText>

          {/* PIN */}
          <Controller
            control={control}
            name="pin"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="PIN"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="numeric"
                secureTextEntry={!pinVisible}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={pinVisible ? 'eye-off' : 'eye'}
                    onPress={() => setPinVisible(!pinVisible)}
                  />
                }
                error={!!errors.pin}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.pin}>
            {errors.pin?.message}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            Sign In
          </Button>
        </View>

        <Text variant="bodySmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
          Telangana Electricity Employees Union · 1104
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Hero (red top section)
  heroSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  appName: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  navyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  navyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Scrollable content
  container: { flexGrow: 1, padding: 24, paddingTop: 28 },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontWeight: '700', marginBottom: 4 },
  input: { marginBottom: 2 },
  loginButton: { marginTop: 8, borderRadius: 8 },
  loginButtonContent: { height: 48 },
  footer: { textAlign: 'center', marginTop: 32 },
});
