import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {UserProfile, UserProfileResponse} from "../../../shared/types/user.ts";

export interface UserLookupData {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
}
interface UserLookupResponse {
    success: boolean;
    data: UserLookupData;
    message: string;
}
export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }, }
    ),

    endpoints: (builder) => ({
        getUserProfile: builder.query<UserProfile, string>({
            query: (username) => `user/username/${username}`,
            transformResponse: (response: UserProfileResponse) => response.data,
        }),
        lookupUserByEmail: builder.query<UserLookupData, string>({
            query: (email) => `user/email/${encodeURIComponent(email)}`,
            transformResponse: (response: UserLookupResponse) => response.data,
        }),
    }),
});

export const { useGetUserProfileQuery, useLazyLookupUserByEmailQuery } = userApi;