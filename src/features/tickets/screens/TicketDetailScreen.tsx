import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Text, useTheme, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketByIdQuery, useAddCommentMutation } from '../../../api/ticketsApi';
import { useResponsive } from '../../../hooks/useResponsive';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';

type RouteP = RouteProp<TicketsStackParamList, 'TicketDetail'>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  author?: { fullName?: string };
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  category?: { name: string };
  comments?: Comment[];
}

// ─── MetaBadge ────────────────────────────────────────────────────────────────
function MetaBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.metaBadge, { backgroundColor: color + '15', borderColor: color + '40', borderWidth: 1 }]}>
      <Text style={{ fontSize: 10, color, fontWeight: '700' }}>{label.toUpperCase()}</Text>
      <Text style={{ fontSize: 13, color, fontWeight: '600', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────
interface DetailPanelProps {
  ticket: Ticket;
  sideBySide: boolean;
  primaryColor: string;
  secondaryColor: string;
  onSurfaceVariantColor: string;
}

function DetailPanel({ ticket, sideBySide, primaryColor, secondaryColor, onSurfaceVariantColor }: DetailPanelProps) {
  return (
    <View style={{ flex: sideBySide ? 1 : undefined }}>
      <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 8 }}>
        {ticket.title}
      </Text>

      <View style={styles.metaRow}>
        <MetaBadge label="Priority" value={ticket.priority} color={
          ({ standard: '#4CAF50', urgent: '#FF9800', critical: '#B71C1C' })[ticket.priority as 'standard' | 'urgent' | 'critical'] ?? '#ccc'
        } />
        {ticket.category && (
          <MetaBadge label="Category" value={ticket.category.name} color={primaryColor} />
        )}
        <MetaBadge label="Created" value={dayjs(ticket.createdAt).format('DD MMM')} color={secondaryColor} />
      </View>

      <Divider style={{ marginVertical: 16 }} />

      <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 8 }}>Description</Text>
      <Text variant="bodyMedium" style={{ color: onSurfaceVariantColor, lineHeight: 22 }}>
        {ticket.description}
      </Text>

      {!sideBySide && <Divider style={{ marginVertical: 16 }} />}
    </View>
  );
}

// ─── CommentsPanel ────────────────────────────────────────────────────────────
interface CommentsPanelProps {
  ticket: Ticket;
  sideBySide: boolean;
  comment: string;
  onChangeComment: (v: string) => void;
  onPost: () => void;
  posting: boolean;
  outlineColor: string;
  surfaceColor: string;
  onSurfaceColor: string;
  onSurfaceVariantColor: string;
  primaryColor: string;
}

function CommentsPanel({
  ticket, sideBySide, comment, onChangeComment, onPost, posting,
  outlineColor, surfaceColor, onSurfaceColor, onSurfaceVariantColor, primaryColor,
}: CommentsPanelProps) {
  const canComment = ticket.status !== 'closed' && ticket.status !== 'resolved';

  return (
    <View style={{ flex: sideBySide ? 1 : undefined }}>
      {sideBySide && <Divider style={{ marginBottom: 16 }} />}
      <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 12 }}>
        Comments ({ticket.comments?.length ?? 0})
      </Text>

      {(ticket.comments ?? []).map((c) => (
        <Card key={c.id} style={[styles.commentCard, { backgroundColor: surfaceColor }]} mode="elevated">
          <Card.Content>
            <View style={styles.commentHeader}>
              <Text variant="bodySmall" style={{ fontWeight: '600', color: primaryColor }}>
                {c.author?.fullName ?? 'Member'}
              </Text>
              <Text variant="bodySmall" style={{ color: onSurfaceVariantColor }}>
                {dayjs(c.createdAt).format('DD MMM, HH:mm')}
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ marginTop: 6, lineHeight: 20 }}>{c.comment}</Text>
          </Card.Content>
        </Card>
      ))}

      {canComment && (
        <View style={styles.addComment}>
          <View style={[styles.commentInputWrapper, { borderColor: outlineColor, backgroundColor: surfaceColor }]}>
            <RNTextInput
              value={comment}
              onChangeText={onChangeComment}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
              onSubmitEditing={() => {}}
              placeholder="Add a comment…"
              placeholderTextColor={onSurfaceVariantColor}
              style={[styles.commentInput, { color: onSurfaceColor }]}
              textAlignVertical="top"
            />
          </View>
          <Button
            mode="contained"
            onPress={onPost}
            loading={posting}
            disabled={posting || comment.trim().length < 5}
          >
            Post Comment
          </Button>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TicketDetailScreen() {
  const theme = useTheme();
  const { params } = useRoute<RouteP>();
  const [comment, setComment] = useState('');
  const { data: ticket, isLoading } = useGetTicketByIdQuery(params.ticketId);
  const [addComment, { isLoading: adding }] = useAddCommentMutation();
  const { isTablet, isLandscape, contentWidth, hPad } = useResponsive();

  const sideBySide = isTablet && isLandscape;

  const statusColors: Record<string, string> = {
    open: '#1565C0', in_progress: '#E65100', escalated: '#6A1B9A',
    resolved: '#757575', closed: '#757575',
  };

  const handleAddComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    if (trimmed.length < 5) {
      Toast.show({ type: 'error', text1: 'Comment too short', text2: 'Please enter at least 5 characters.' });
      return;
    }
    try {
      await addComment({ ticketId: params.ticketId, comment: trimmed }).unwrap();
      setComment('');
      Toast.show({ type: 'success', text1: 'Comment added' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add comment' });
    }
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;
  if (!ticket) return null;

  const statusColor = statusColors[ticket.status] ?? '#ccc';
  const statusLabel = ticket.status === 'resolved'
    ? 'Closed'
    : ticket.status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase());

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Status header — full width */}
      <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
        <Text style={styles.ticketId}>#{ticket.id.slice(-8).toUpperCase()}</Text>
      </View>

      {/* Centred content wrapper */}
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.content, { width: contentWidth, paddingHorizontal: hPad }]}>
          {sideBySide ? (
            <View style={styles.twoCol}>
              <DetailPanel
                ticket={ticket}
                sideBySide={sideBySide}
                primaryColor={theme.colors.primary}
                secondaryColor={theme.colors.secondary}
                onSurfaceVariantColor={theme.colors.onSurfaceVariant}
              />
              <View style={styles.colDivider} />
              <CommentsPanel
                ticket={ticket}
                sideBySide={sideBySide}
                comment={comment}
                onChangeComment={setComment}
                onPost={handleAddComment}
                posting={adding}
                outlineColor={theme.colors.outline}
                surfaceColor={theme.colors.surface}
                onSurfaceColor={theme.colors.onSurface}
                onSurfaceVariantColor={theme.colors.onSurfaceVariant}
                primaryColor={theme.colors.primary}
              />
            </View>
          ) : (
            <>
              <DetailPanel
                ticket={ticket}
                sideBySide={sideBySide}
                primaryColor={theme.colors.primary}
                secondaryColor={theme.colors.secondary}
                onSurfaceVariantColor={theme.colors.onSurfaceVariant}
              />
              <CommentsPanel
                ticket={ticket}
                sideBySide={sideBySide}
                comment={comment}
                onChangeComment={setComment}
                onPost={handleAddComment}
                posting={adding}
                outlineColor={theme.colors.outline}
                surfaceColor={theme.colors.surface}
                onSurfaceColor={theme.colors.onSurface}
                onSurfaceVariantColor={theme.colors.onSurfaceVariant}
                primaryColor={theme.colors.primary}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ticketId: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  content: { paddingVertical: 20 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  metaBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: 80 },
  commentCard: { marginBottom: 10, borderRadius: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  addComment: { marginTop: 16, paddingBottom: 32 },
  commentInputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 90,
  },
  commentInput: {
    fontSize: 15,
    minHeight: 74,
    lineHeight: 22,
  },
  twoCol: { flexDirection: 'row', gap: 0, alignItems: 'flex-start' },
  colDivider: { width: 1, backgroundColor: '#e0e0e0', marginHorizontal: 24, alignSelf: 'stretch' },
});
