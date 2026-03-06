import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { PaginatedResponse, Ticket } from '../types';

export const ticketsApi = createApi({
  reducerPath: 'ticketsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Ticket'],
  endpoints: (builder) => ({
    getTickets: builder.query<PaginatedResponse<Ticket>, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: '/tickets', params }),
      providesTags: ['Ticket'],
    }),
    getTicketById: builder.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Ticket', id }],
    }),
    createTicket: builder.mutation<Ticket, { title: string; description: string; categoryId: string; priority: string }>({
      query: (body) => ({ url: '/tickets', method: 'POST', body }),
      invalidatesTags: ['Ticket'],
    }),
    addComment: builder.mutation<any, { ticketId: string; comment: string; isInternal?: boolean }>({
      query: ({ ticketId, ...body }) => ({ url: `/tickets/${ticketId}/comments`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: 'Ticket', id: ticketId }],
    }),
    updateStatus: builder.mutation<any, { ticketId: string; status: string; notes?: string }>({
      query: ({ ticketId, ...body }) => ({ url: `/tickets/${ticketId}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Ticket'],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useAddCommentMutation,
  useUpdateStatusMutation,
} = ticketsApi;
