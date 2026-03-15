import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { NewsArticle, PaginatedResponse } from '../types';

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['News'],
  keepUnusedDataFor: 600, // 10 minutes — news changes infrequently
  endpoints: (builder) => ({
    getNews: builder.query<PaginatedResponse<NewsArticle>, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/news', params }),
      providesTags: ['News'],
    }),
    getNewsById: builder.query<NewsArticle, string>({
      query: (id) => `/news/${id}`,
    }),
  }),
});

export const { useGetNewsQuery, useGetNewsByIdQuery } = newsApi;
