import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {UserProfile, UserProfileResponse} from "../../../shared/types/user.ts";

export interface UserLookupData {
    id: string;
    email: string;
    name: string;
    avatar: string;
}
interface UserLookupResponse {
    success: boolean;
    data: UserLookupData;
    message: string;
}
export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api' }),
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