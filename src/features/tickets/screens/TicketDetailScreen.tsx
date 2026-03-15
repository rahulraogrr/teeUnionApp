import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TextInput as RNTextInput, Modal,
  TouchableOpacity, TouchableWithoutFeedback,
} from 'react-native';
import { Text, useTheme, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketByIdQuery, useAddCommentMutation, useUpdateStatusMutation } from '../../../api/ticketsApi';
import { useResponsive } from '../../../hooks/useResponsive';
import { useAppSelector } from '../../../store';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';

type RouteP = RouteProp<TicketsStackParamList, 'TicketDetail'>;

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  open: '#1565C0', in_progress: '#E65100', escalated: '#6A1B9A',
  resolved: '#2E7D32', closed: '#757575',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', escalated: 'Escalated',
  resolved: 'Resolved', closed: 'Closed',
};

// Valid status transitions for reps/admins
const NEXT_STATUSES: Record<string, string[]> = {
  open:        ['in_progress'],
  in_progress: ['escalated', 'resolved'],
  escalated:   ['in_progress', 'resolved'],
  resolved:    ['closed'],
  closed:      [],
};

const PRIORITY_COLORS: Record<string, string> = {
  standard: '#4CAF50', urgent: '#FF9800', critical: '#B71C1C',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  comment: string;
  isInternal?: boolean;
  createdAt: string;
  author?: { firstName?: string; middleName?: string; lastName?: string };
  user?: { employeeId: string; role: string };
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  slaDeadline?: string;
  category?: { name: string };
  assignedRep?: { id: string; employeeId: string };
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

// ─── StatusChangeModal ────────────────────────────────────────────────────────
interface StatusChangeModalProps {
  visible: boolean;
  currentStatus: string;
  ticketId: string;
  onClose: () => void;
}

function StatusChangeModal({ visible, currentStatus, ticketId, onClose }: StatusChangeModalProps) {
  const theme = useTheme();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updateStatus, { isLoading }] = useUpdateStatusMutation();

  const nextOptions = NEXT_STATUSES[currentStatus] ?? [];

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    try {
      await updateStatus({ ticketId, status: selectedStatus, notes: notes.trim() || undefined }).unwrap();
      Toast.show({ type: 'success', text1: 'Status updated', text2: `Ticket is now ${STATUS_LABEL[selectedStatus]}` });
      setSelectedStatus('');
      setNotes('');
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.modalHandle} />

        <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 4 }}>
          Update Status
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
          Current: <Text style={{ fontWeight: '600', color: STATUS_COLORS[currentStatus] }}>{STATUS_LABEL[currentStatus]}</Text>
        </Text>

        {nextOptions.length === 0 ? (
          <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginVertical: 16 }}>
            This ticket is closed — no further status changes possible.
          </Text>
        ) : (
          <>
            <Text variant="labelMedium" style={{ marginBottom: 10, color: theme.colors.onSurfaceVariant }}>
              MOVE TO
            </Text>
            <View style={styles.statusOptions}>
              {nextOptions.map((s) => {
                const active = selectedStatus === s;
                const color = STATUS_COLORS[s] ?? '#999';
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusOption,
                      { borderColor: active ? color : theme.colors.outlineVariant,
                        backgroundColor: active ? color + '15' : theme.colors.background },
                    ]}
                    onPress={() => setSelectedStatus(s)}
                  >
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={{ fontWeight: '600', color: active ? color : theme.colors.onSurface }}>
                      {STATUS_LABEL[s]}
                    </Text>
                    {active && <Icon name="check-circle" size={18} color={color} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text variant="labelMedium" style={{ marginTop: 20, marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
              NOTES (OPTIONAL)
            </Text>
            <View style={[styles.notesWrapper, { borderColor: theme.colors.outline, backgroundColor: theme.colors.background }]}>
              <RNTextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Add a note about this status change…"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={[styles.notesInput, { color: theme.colors.onSurface }]}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={onClose} style={{ flex: 1 }}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={!selectedStatus || isLoading}
                style={{ flex: 1 }}
              >
                Update
              </Button>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────
interface DetailPanelProps {
  ticket: Ticket;
  sideBySide: boolean;
  canChangeStatus: boolean;
  primaryColor: string;
  secondaryColor: string;
  onSurfaceVariantColor: string;
  onOpenStatusModal: () => void;
}

function DetailPanel({
  ticket, sideBySide, canChangeStatus,
  primaryColor, secondaryColor, onSurfaceVariantColor, onOpenStatusModal,
}: DetailPanelProps) {
  const theme = useTheme();
  const isOverdue = ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date()
    && ticket.status !== 'resolved' && ticket.status !== 'closed';

  return (
    <View style={{ flex: sideBySide ? 1 : undefined }}>
      <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 8 }}>
        {ticket.title}
      </Text>

      <View style={styles.metaRow}>
        <MetaBadge
          label="Priority"
          value={ticket.priority}
          color={PRIORITY_COLORS[ticket.priority] ?? '#ccc'}
        />
        {ticket.category && (
          <MetaBadge label="Category" value={ticket.category.name} color={primaryColor} />
        )}
        <MetaBadge label="Created" value={dayjs(ticket.createdAt).format('DD MMM')} color={secondaryColor} />
        {ticket.slaDeadline && (
          <MetaBadge
            label="SLA"
            value={dayjs(ticket.slaDeadline).format('DD MMM')}
            color={isOverdue ? '#B71C1C' : '#757575'}
          />
        )}
      </View>

      {ticket.assignedRep && (
        <View style={[styles.assignedBadge, { backgroundColor: primaryColor + '10', borderColor: primaryColor + '30' }]}>
          <Icon name="account-tie" size={14} color={primaryColor} />
          <Text style={{ fontSize: 12, color: primaryColor, marginLeft: 6 }}>
            Assigned to <Text style={{ fontWeight: '700' }}>{ticket.assignedRep.employeeId}</Text>
          </Text>
        </View>
      )}

      <Divider style={{ marginVertical: 16 }} />

      <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 8 }}>Description</Text>
      <Text variant="bodyMedium" style={{ color: onSurfaceVariantColor, lineHeight: 22 }}>
        {ticket.description}
      </Text>

      {/* Status change button — visible to reps/admins only */}
      {canChangeStatus && NEXT_STATUSES[ticket.status]?.length > 0 && (
        <Button
          mode="contained-tonal"
          icon="swap-horizontal"
          onPress={onOpenStatusModal}
          style={{ marginTop: 20 }}
        >
          Update Status
        </Button>
      )}

      {!sideBySide && <Divider style={{ marginVertical: 16 }} />}
    </View>
  );
}

// ─── CommentsPanel ────────────────────────────────────────────────────────────
interface CommentsPanelProps {
  ticket: Ticket;
  sideBySide: boolean;
  userRole: string;
  comment: string;
  isInternal: boolean;
  onChangeComment: (v: string) => void;
  onToggleInternal: (v: boolean) => void;
  onPost: () => void;
  posting: boolean;
  outlineColor: string;
  surfaceColor: string;
  onSurfaceColor: string;
  onSurfaceVariantColor: string;
  primaryColor: string;
}

function CommentsPanel({
  ticket, sideBySide, userRole, comment, isInternal,
  onChangeComment, onToggleInternal, onPost, posting,
  outlineColor, surfaceColor, onSurfaceColor, onSurfaceVariantColor, primaryColor,
}: CommentsPanelProps) {
  const theme = useTheme();
  const canComment   = ticket.status !== 'closed';
  const canInternal  = userRole !== 'member';

  return (
    <View style={{ flex: sideBySide ? 1 : undefined }}>
      {sideBySide && <Divider style={{ marginBottom: 16 }} />}
      <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: 12 }}>
        Comments ({ticket.comments?.length ?? 0})
      </Text>

      {(ticket.comments ?? []).map((c) => {
        const isInternalComment = c.isInternal;
        return (
          <Card
            key={c.id}
            style={[
              styles.commentCard,
              { backgroundColor: isInternalComment ? '#FFF8E1' : surfaceColor,
                borderLeftWidth: isInternalComment ? 3 : 0,
                borderLeftColor: '#F9A825' },
            ]}
            mode="elevated"
          >
            <Card.Content>
              <View style={styles.commentHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="bodySmall" style={{ fontWeight: '600', color: primaryColor }}>
                    {[c.author?.firstName, c.author?.lastName].filter(Boolean).join(' ') || c.user?.employeeId || 'Member'}
                  </Text>
                  {isInternalComment && (
                    <View style={styles.internalBadge}>
                      <Text style={{ fontSize: 9, color: '#F57F17', fontWeight: '700' }}>INTERNAL</Text>
                    </View>
                  )}
                </View>
                <Text variant="bodySmall" style={{ color: onSurfaceVariantColor }}>
                  {dayjs(c.createdAt).format('DD MMM, HH:mm')}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ marginTop: 6, lineHeight: 20 }}>{c.comment}</Text>
            </Card.Content>
          </Card>
        );
      })}

      {canComment && (
        <View style={styles.addComment}>
          {/* Internal toggle — only for rep/admin */}
          {canInternal && (
            <TouchableOpacity
              style={[
                styles.internalToggle,
                { borderColor: isInternal ? '#F9A825' : outlineColor,
                  backgroundColor: isInternal ? '#FFF8E1' : surfaceColor },
              ]}
              onPress={() => onToggleInternal(!isInternal)}
            >
              <Icon
                name={isInternal ? 'eye-off' : 'eye'}
                size={16}
                color={isInternal ? '#F9A825' : onSurfaceVariantColor}
              />
              <Text style={{ marginLeft: 8, fontSize: 13, color: isInternal ? '#F9A825' : onSurfaceVariantColor, fontWeight: isInternal ? '700' : '400' }}>
                {isInternal ? 'Internal note (hidden from member)' : 'Visible to member — tap to make internal'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[
            styles.commentInputWrapper,
            { borderColor: isInternal ? '#F9A825' : outlineColor,
              backgroundColor: isInternal ? '#FFFDE7' : surfaceColor },
          ]}>
            <RNTextInput
              value={comment}
              onChangeText={onChangeComment}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
              onSubmitEditing={() => {}}
              placeholder={isInternal ? 'Add an internal note…' : 'Add a comment…'}
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
            buttonColor={isInternal ? '#F9A825' : undefined}
          >
            {isInternal ? 'Post Internal Note' : 'Post Comment'}
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
  const [isInternal, setIsInternal] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const userRole = useAppSelector((s) => s.auth.user?.role ?? 'member');
  const canChangeStatus = ['rep', 'zonal_officer', 'admin', 'super_admin'].includes(userRole);

  const { data: ticket, isLoading } = useGetTicketByIdQuery(params.ticketId);
  const [addComment, { isLoading: adding }] = useAddCommentMutation();
  const { isTablet, isLandscape, contentWidth, hPad } = useResponsive();

  const sideBySide = isTablet && isLandscape;

  const handleAddComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    if (trimmed.length < 5) {
      Toast.show({ type: 'error', text1: 'Comment too short', text2: 'Please enter at least 5 characters.' });
      return;
    }
    try {
      await addComment({ ticketId: params.ticketId, comment: trimmed, isInternal }).unwrap();
      setComment('');
      setIsInternal(false);
      Toast.show({ type: 'success', text1: isInternal ? 'Internal note added' : 'Comment added' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add comment' });
    }
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;
  if (!ticket) return null;

  const statusColor = STATUS_COLORS[ticket.status] ?? '#ccc';
  const statusLabel = STATUS_LABEL[ticket.status] ?? ticket.status;

  const detailProps = {
    ticket,
    sideBySide,
    canChangeStatus,
    primaryColor: theme.colors.primary,
    secondaryColor: theme.colors.secondary,
    onSurfaceVariantColor: theme.colors.onSurfaceVariant,
    onOpenStatusModal: () => setStatusModalVisible(true),
  };

  const commentsProps = {
    ticket,
    sideBySide,
    userRole,
    comment,
    isInternal,
    onChangeComment: setComment,
    onToggleInternal: setIsInternal,
    onPost: handleAddComment,
    posting: adding,
    outlineColor: theme.colors.outline,
    surfaceColor: theme.colors.surface,
    onSurfaceColor: theme.colors.onSurface,
    onSurfaceVariantColor: theme.colors.onSurfaceVariant,
    primaryColor: theme.colors.primary,
  };

  return (
    <>
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
                <DetailPanel {...detailProps} />
                <View style={styles.colDivider} />
                <CommentsPanel {...commentsProps} />
              </View>
            ) : (
              <>
                <DetailPanel {...detailProps} />
                <CommentsPanel {...commentsProps} />
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <StatusChangeModal
        visible={statusModalVisible}
        currentStatus={ticket.status}
        ticketId={ticket.id}
        onClose={() => setStatusModalVisible(false)}
      />
    </>
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
  assignedBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start',
  },
  commentCard: { marginBottom: 10, borderRadius: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  internalBadge: {
    backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#F9A825',
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  addComment: { marginTop: 16, paddingBottom: 32 },
  internalToggle: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10,
  },
  commentInputWrapper: {
    borderWidth: 1, borderRadius: 8, marginBottom: 10,
    paddingHorizontal: 12, paddingVertical: 8, minHeight: 90,
  },
  commentInput: { fontSize: 15, minHeight: 74, lineHeight: 22 },
  twoCol: { flexDirection: 'row', gap: 0, alignItems: 'flex-start' },
  colDivider: { width: 1, backgroundColor: '#e0e0e0', marginHorizontal: 24, alignSelf: 'stretch' },
  // Status modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
    elevation: 8,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#ccc',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  statusOptions: { gap: 10 },
  statusOption: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 10, padding: 14, gap: 10,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  notesWrapper: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, minHeight: 80,
  },
  notesInput: { fontSize: 14, minHeight: 64, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
