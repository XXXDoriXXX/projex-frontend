import type { User } from "../../../shared/types/user.ts";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setToken, setUser } from '../authSlice';

interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
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
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Тепер dispatch працюватиме, бо ми імпортували екшени зверху
                    dispatch(setToken(data.token));
                    if (data.user) {
                        dispatch(setUser(data.user));
                    }
                } catch (err) {
                    console.error("Login failed internally:", err);
                }
            },
        }),
        register: builder.mutation<{ token: string }, { username: string; email: string; password: string }>({
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
        getProfile: builder.query<User, void>({
            query: () => 'auth/me',
            transformResponse: (response: UserResponse) => response.data,
            providesTags: ['User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useGetProfileQuery,
    useRegisterMutation,
    useVerifyEmailMutation,
    useSendVerificationCodeMutation
} = authApi;