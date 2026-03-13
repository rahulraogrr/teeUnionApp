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

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Please describe the issue in detail (min 20 chars)'),
  priority: z.enum(['standard', 'urgent', 'critical']),
  categoryId: z.string().min(1, 'Please select a category'),
});

type FormData = z.infer<typeof schema>;
type NavProp = NativeStackNavigationProp<TicketsStackParamList, 'CreateTicket'>;

// Hardcoded for now — could be loaded from API
const CATEGORIES = [
  { id: 'cat-1', label: 'Salary' },
  { id: 'cat-2', label: 'Provident Fund' },
  { id: 'cat-3', label: 'Transfer' },
  { id: 'cat-4', label: 'Medical' },
  { id: 'cat-5', label: 'Other' },
];

export default function CreateTicketScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'standard', categoryId: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createTicket(data).unwrap();
      Toast.show({ type: 'success', text1: 'Ticket raised successfully!' });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed to raise ticket', text2: err?.data?.message });
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
          <TextInput label="Title *" value={value} onChangeText={onChange} mode="outlined"
            placeholder="Brief summary of the issue" error={!!errors.title} style={styles.input} />
        )} />
        <HelperText type="error" visible={!!errors.title}>{errors.title?.message}</HelperText>

        {/* Description */}
        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <TextInput label="Description *" value={value} onChangeText={onChange} mode="outlined"
            multiline numberOfLines={5} placeholder="Describe the issue in detail..."
            error={!!errors.description} style={styles.input} />
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

        {/* Category */}
        <Text variant="bodySmall" style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>
          Category *
        </Text>
        <Controller control={control} name="categoryId" render={({ field: { onChange, value } }) => (
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Button key={cat.id} mode={value === cat.id ? 'contained' : 'outlined'}
                onPress={() => onChange(cat.id)} compact style={styles.catBtn}>
                {cat.label}
              </Button>
            ))}
          </View>
        )} />
        <HelperText type="error" visible={!!errors.categoryId}>{errors.categoryId?.message}</HelperText>

        <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isLoading}
          disabled={isLoading} style={styles.submitBtn} contentStyle={styles.submitContent}>
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
  fieldLabel: { marginBottom: 8, marginTop: 12 },
  segmented: { marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  catBtn: { borderRadius: 8 },
  submitBtn: { marginTop: 24, borderRadius: 8 },
  submitContent: { height: 48 },
});
