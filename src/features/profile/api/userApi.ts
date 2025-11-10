import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {User, UserProfile, UserProfileResponse} from "../../../shared/types/user.ts";
import { setUser } from '../../auth/authSlice.ts';
import type {VerificationSuccessResponse} from "../../auth/api/authApi.ts";
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
interface UserUpdatePayload {
    username?: string;
    bio?: string;
    avatarUrl?: string;

}
interface UpdateProfileResponse {
    success: boolean;
    data: User;
    message: string;
}
export interface SimpleUser {
    id: string;
    username: string;
    avatarUrl?: string;
     bio?: string;
}

interface SocialLinkPayload {
    platform: string;
    url: string;
    handle?: string;
}
export interface ResetPasswordRequest {
    code: string;
    newPassword: string;
}

interface DeleteSocialLinkPayload {
    socialMediaId: string;
}
interface SocialMedia {
    id: string;
    platform: string;
    url: string;
    handle?: string;
}
interface FollowStatusApiResponse {
    success: boolean;
    data: {
        isFollowed: boolean;
    };
    message: string;
}

export interface FollowStatus {
    isFollowing: boolean;
}
interface UsersListResponse {
    success: boolean;
    data: SimpleUser[];
    message: string;
}
export const userApi = createApi({
    reducerPath: 'userApi',
    tagTypes: ['User', 'Profile', 'FollowLists', 'FollowStatus'],
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

    endpoints: (builder) => ({
        getUserProfile: builder.query<UserProfile, string>({
            query: (username) => `user/username/${username}`,
            transformResponse: (response: UserProfileResponse) => response.data,
            providesTags: (result, error, username) => [{ type: 'Profile', id: username }],
        }),
        lookupUserByEmail: builder.query<UserLookupData, string>({
            query: (email) => `user/email/${encodeURIComponent(email)}`,
            transformResponse: (response: UserLookupResponse) => response.data,
        }),

        updateUserProfile: builder.mutation<User, UserUpdatePayload>({
            query: (data) => ({
                url: 'user/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result) => result ? [{ type: 'Profile', id: result.username }, 'User'] : ['Profile', 'User'],
            transformResponse: (response: UpdateProfileResponse) => response.data,
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: updatedUser } = await queryFulfilled;
                    dispatch(setUser(updatedUser));
                } catch (err) { }
            },
        }),

        addSocialMediaLink: builder.mutation<SocialMedia, SocialLinkPayload>({
            query: (link) => ({
                url: 'user/social',
                method: 'POST',
                body: link,
            }),
            invalidatesTags: ['Profile'],
        }),

        deleteSocialMediaLink: builder.mutation<void, DeleteSocialLinkPayload>({
            query: ({ socialMediaId }) => ({
                url: `user/social/${socialMediaId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile'],
        }),
        sendPasswordResetCode: builder.mutation<VerificationSuccessResponse, { password?: string }>({
            query: (body) => ({
                url: 'auth/send-reset-password',
                method: 'POST',
                body,
            }),
        }),
        resetPassword: builder.mutation<VerificationSuccessResponse, ResetPasswordRequest>({
            query: (body) => ({
                url: 'auth/reset-password',
                method: 'POST',
                body,
            }),
        }),
        updateUserAvatar: builder.mutation<string, FormData>({
            query: (formData) => ({
                url: 'user/avatar',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Profile', 'User'],
            transformResponse: (response: { success: boolean, data: string }) => response.data,
            async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data: newAvatarUrl } = await queryFulfilled;
                    const currentUser = (getState() as any).auth.user;
                    if (currentUser) {

                        dispatch(setUser({ ...currentUser, avatarUrl: newAvatarUrl }));
                    }
                } catch (err) { }
            },
        }),
        followUser: builder.mutation<void, string>({
            query: (userId) => ({
                url: `user/follow/${userId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, userId) => [
                { type: 'Profile', id: userId },
                { type: 'FollowStatus', id: userId },
                'Profile',
                'FollowLists'
            ],
        }),

        unfollowUser: builder.mutation<void, string>({
            query: (userId) => ({
                url: `user/follow/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, userId) => [
                { type: 'Profile', id: userId },
                { type: 'FollowStatus', id: userId },
                'Profile',
                'FollowLists'
            ],
        }),
        getIsUserFollowed: builder.query<FollowStatus, string>({
            query: (userId) => `user/follow/status/${userId}`,
            transformResponse: (response: FollowStatusApiResponse) => ({
                isFollowing: response.data.isFollowed
            }),
            providesTags: (result, error, userId) => [{ type: 'FollowStatus', id: userId }],
        }),
        getFollowers: builder.query<SimpleUser[], string>({
            query: (userId) => `user/${userId}/followers`,
            transformResponse: (response: UsersListResponse) => response.data,
            providesTags: ['FollowLists'],
        }),

        getFollowing: builder.query<SimpleUser[], string>({
            query: (userId) => `user/${userId}/following`,
            transformResponse: (response: UsersListResponse) => response.data,
            providesTags: ['FollowLists'],
        }),
    }),
});

export const {
    useGetUserProfileQuery,
    useLazyLookupUserByEmailQuery,
    useUpdateUserProfileMutation,
    useAddSocialMediaLinkMutation,
    useDeleteSocialMediaLinkMutation,
    useUpdateUserAvatarMutation,
    useSendPasswordResetCodeMutation,
    useResetPasswordMutation,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetFollowersQuery,
    useGetFollowingQuery,
    useGetIsUserFollowedQuery,
} = userApi;