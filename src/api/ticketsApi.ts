import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { PaginatedResponse, Ticket } from '../types';

export interface TicketCounts {
  open: number;
  in_progress: number;
  escalated: number;
  resolved: number;
  closed: number;
}

export const ticketsApi = createApi({
  reducerPath: 'ticketsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Ticket', 'TicketCounts'],
  keepUnusedDataFor: 300, // 5 minutes
  endpoints: (builder) => ({
    getTickets: builder.query<PaginatedResponse<Ticket>, { page?: number; limit?: number; status?: string }>({
      // Prisma enum is lowercase (open, in_progress…) — normalise before sending
      query: ({ status, ...rest }) => ({
        url: '/tickets',
        params: { ...rest, ...(status ? { status: status.toLowerCase() } : {}) },
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map((t) => ({ type: 'Ticket' as const, id: t.id })), 'Ticket']
          : ['Ticket'],
    }),
    getTicketCounts: builder.query<TicketCounts, void>({
      query: () => '/tickets/counts',
      providesTags: ['TicketCounts'],
    }),
    getTicketById: builder.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Ticket', id }],
    }),
    createTicket: builder.mutation<Ticket, { title: string; description?: string; categoryId?: string; priority?: string }>({
      query: (body) => ({ url: '/tickets', method: 'POST', body }),
      invalidatesTags: ['Ticket', 'TicketCounts'],
    }),
    addComment: builder.mutation<any, { ticketId: string; comment: string; isInternal?: boolean }>({
      query: ({ ticketId, ...body }) => ({ url: `/tickets/${ticketId}/comments`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: 'Ticket', id: ticketId }],
    }),
    updateStatus: builder.mutation<any, { ticketId: string; status: string; notes?: string }>({
      query: ({ ticketId, ...body }) => ({ url: `/tickets/${ticketId}/status`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: 'Ticket', id: ticketId }, 'TicketCounts'],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketCountsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useAddCommentMutation,
  useUpdateStatusMutation,
} = ticketsApi;
