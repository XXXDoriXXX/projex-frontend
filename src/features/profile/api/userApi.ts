import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {UserProfile, UserProfileResponse} from "../../../shared/types/user.ts";


export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api' }),
    endpoints: (builder) => ({
        getUserProfile: builder.query<UserProfile, string>({
            query: (username) => `user/${username}`,
            transformResponse: (response: UserProfileResponse) => response.data,
        }),
    }),
});

export const { useGetUserProfileQuery } = userApi;