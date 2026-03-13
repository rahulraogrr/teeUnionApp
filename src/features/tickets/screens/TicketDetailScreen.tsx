import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Card, TextInput, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketByIdQuery, useAddCommentMutation } from '../../../api/ticketsApi';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';

type RouteP = RouteProp<TicketsStackParamList, 'TicketDetail'>;

export default function TicketDetailScreen() {
  const theme = useTheme();
  const { params } = useRoute<RouteP>();
  const [comment, setComment] = useState('');
  const { data: ticket, isLoading } = useGetTicketByIdQuery(params.ticketId);
  const [addComment, { isLoading: adding }] = useAddCommentMutation();

  const statusColors: Record<string, string> = {
    OPEN: '#1565C0', IN_PROGRESS: '#E65100', ESCALATED: '#6A1B9A', RESOLVED: '#757575', CLOSED: '#757575',
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment({ ticketId: params.ticketId, comment: comment.trim() }).unwrap();
      setComment('');
      Toast.show({ type: 'success', text1: 'Comment added' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add comment' });
    }
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;
  if (!ticket) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Status header */}
      <View style={[styles.statusHeader, { backgroundColor: statusColors[ticket.status] ?? '#ccc' }]}>
        <Text style={styles.statusText}>
          {ticket.status === 'RESOLVED' ? 'Closed' : ticket.status.replace('_', ' ')}
        </Text>
        <Text style={styles.ticketId}>#{ticket.id.slice(-8).toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 8 }}>
          {ticket.title}
        </Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <MetaBadge label="Priority" value={ticket.priority} color={
            ({ standard: '#4CAF50', urgent: '#FF9800', critical: '#B71C1C' })[ticket.priority] ?? '#ccc'
          } />
          {ticket.category && <MetaBadge label="Category" value={ticket.category.name} color={theme.colors.primary} />}
          <MetaBadge label="Created" value={dayjs(ticket.createdAt).format('DD MMM')} color={theme.colors.secondary} />
        </View>

        <Divider style={{ marginVertical: 16 }} />

        {/* Description */}
        <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 8 }}>Description</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>
          {ticket.description}
        </Text>

        <Divider style={{ marginVertical: 16 }} />

        {/* Comments */}
        <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 12 }}>
          Comments ({ticket.comments?.length ?? 0})
        </Text>

        {(ticket.comments ?? []).map((c) => (
          <Card key={c.id} style={[styles.commentCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
              <View style={styles.commentHeader}>
                <Text variant="bodySmall" style={{ fontWeight: '600', color: theme.colors.primary }}>
                  {c.author?.fullName ?? 'Member'}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {dayjs(c.createdAt).format('DD MMM, HH:mm')}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ marginTop: 6, lineHeight: 20 }}>{c.comment}</Text>
            </Card.Content>
          </Card>
        ))}

        {/* Add comment */}
        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
          <View style={styles.addComment}>
            <TextInput
              label="Add a comment"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 8 }}
            />
            <Button mode="contained" onPress={handleAddComment} loading={adding} disabled={adding || !comment.trim()}>
              Post Comment
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function MetaBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.metaBadge, { backgroundColor: color + '15', borderColor: color + '40', borderWidth: 1 }]}>
      <Text style={{ fontSize: 10, color, fontWeight: '700' }}>{label.toUpperCase()}</Text>
      <Text style={{ fontSize: 13, color, fontWeight: '600', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ticketId: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  content: { padding: 16 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  metaBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: 80 },
  commentCard: { marginBottom: 10, borderRadius: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  addComment: { marginTop: 16 },
});
