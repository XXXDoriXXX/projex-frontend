import type {User} from "../../../shared/types/user.ts";

import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";


interface LoginCredentials {
    email: string;
    password: string;
}


export interface UserResponse {
    success: boolean;
    data: User;
    message: string;
}


export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api' }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation<{ token: string }, LoginCredentials>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register:builder.mutation<User, { username: string; email: string; password: string }>({
            query: (userData) => ({
                url: 'auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        getProfile: builder.query<User, string>({
            query: (token) => ({
                url: 'auth/me',
                headers: { Authorization: `Bearer ${token}` },
            }),
            transformResponse: (response: UserResponse) => response.data,
            providesTags: ['User'],
        }),
    }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;