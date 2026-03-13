import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TicketsStackParamList } from '../../../navigation/types';
import { useCreateTicketMutation } from '../../../api/ticketsApi';
import Toast from 'react-native-toast-message';

// Backend: title @MinLength(10), categoryId @IsOptional @IsUUID, priority optional
const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(20, 'Please describe the issue in detail (min 20 chars)').optional().or(z.literal('')),
  priority: z.enum(['standard', 'urgent', 'critical']),
  // Category is optional — stored as a display label only until categories API is wired up
  categoryLabel: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type NavProp = NativeStackNavigationProp<TicketsStackParamList, 'CreateTicket'>;

const CATEGORY_LABELS = ['Salary', 'Provident Fund', 'Transfer', 'Medical', 'Other'];

export default function CreateTicketScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'standard', categoryLabel: undefined },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // categoryId omitted — backend field is optional; will wire up once categories API exists
      await createTicket({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
      }).unwrap();
      Toast.show({ type: 'success', text1: 'Ticket raised successfully!' });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to raise ticket',
        text2: err?.data?.message ?? 'Please try again',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
          Fill in the details below to raise a grievance or support ticket.
        </Text>

        {/* Title */}
        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <TextInput
            label="Title *"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            placeholder="Brief summary of the issue (min 10 chars)"
            error={!!errors.title}
            style={styles.input}
          />
        )} />
        <HelperText type="error" visible={!!errors.title}>{errors.title?.message}</HelperText>

        {/* Description */}
        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            multiline
            numberOfLines={6}
            placeholder="Describe the issue in detail..."
            error={!!errors.description}
            style={styles.textarea}
          />
        )} />
        <HelperText type="error" visible={!!errors.description}>{errors.description?.message}</HelperText>

        {/* Priority */}
        <Text variant="bodySmall" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
          Priority *
        </Text>
        <Controller control={control} name="priority" render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: 'standard', label: 'Standard' },
              { value: 'urgent',   label: 'Urgent' },
              { value: 'critical', label: 'Critical' },
            ]}
            style={styles.segmented}
          />
        )} />

        {/* Category (display label only — not sent to API until categories endpoint exists) */}
        <Text variant="bodySmall" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
          Category
        </Text>
        <Controller control={control} name="categoryLabel" render={({ field: { onChange, value } }) => (
          <View style={styles.categoryGrid}>
            {CATEGORY_LABELS.map((label) => (
              <Button
                key={label}
                mode={value === label ? 'contained' : 'outlined'}
                onPress={() => onChange(value === label ? undefined : label)}
                compact
                style={styles.catBtn}
              >
                {label}
              </Button>
            ))}
          </View>
        )} />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitBtn}
          contentStyle={styles.submitContent}
        >
          Raise Ticket
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  input: { marginBottom: 2 },
  textarea: { marginBottom: 2, minHeight: 120 },
  fieldLabel: { marginBottom: 8, marginTop: 12 },
  segmented: { marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  catBtn: { borderRadius: 8 },
  submitBtn: { marginTop: 24, borderRadius: 8 },
  submitContent: { height: 48 },
});
