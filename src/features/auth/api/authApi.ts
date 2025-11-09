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
export interface VerificationSuccessResponse {
    success: boolean;
    message: string;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL}),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation<{ token: string }, LoginCredentials>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register:builder.mutation<{ token: string }, { username: string; email: string; password: string }>({
            query: (userData) => ({
                url: 'auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        verifyEmail: builder.mutation<VerificationSuccessResponse, { code: string; token: string }>({
            query: ({ code, token }) => ({
                url: `auth/verify-email`,
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: { code }
            }),
        }),
        sendVerificationCode: builder.mutation<void, { token: string }>({
            query: ({ token }) => ({
                url: 'auth/send-verification-code',
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }),
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

// Експорт нових хуків
export const { useLoginMutation, useGetProfileQuery, useRegisterMutation, useVerifyEmailMutation, useSendVerificationCodeMutation } = authApi;