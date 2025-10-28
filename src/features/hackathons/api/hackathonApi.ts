import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {User} from "../../../shared/types/user.ts";


export interface CreateHackathonDto {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    themeIds?: string[];
    ratingCategoryIds?: string[];
    judgeIds?: string[];
    newThemes?: string[];
    newRatingCategories?: { name: string; order: number }[];
    allowParticipantRating: boolean;
    allowPublicRating: boolean;
}

export type UpdateHackathonDto = Partial<CreateHackathonDto>;

export interface SubmitProjectDto {
    projectId: string;
}

export interface RateProjectDto {
    categoryId: string;
    rating: number;
    comment?: string;
}

export interface SimpleHackathon {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    author: { name: string }; // Приклад
}
export interface HackathonListResponse {
    success: boolean;
    data: SimpleHackathon[];
    message: string;
}
export interface HackathonWithDetails{
    // Визначення полів відповідно до вашої моделі
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
    author: User;
    judes: User[];
    themes: { id: string; name: string }[];
    ratingCategories: { id: string; name: string; order: number }[];
    participants: { id: string; user: User }[];
}
export interface HackathonDetailsResponse {
    success: boolean;
    data: HackathonWithDetails;
    message: string;
}

export interface HackathonCreateResponse {
    success: boolean;
    data: { id: string; title: string };
    message: string;
}

export interface HackathonThemeCategory {
    id: string;
    name: string;
}
export interface ThemeListResponse {
    success: boolean;
    data: HackathonThemeCategory[];
    message: string;
}

export interface HackathonRatingCategory {
    id: string;
    name: string;
    order: number;
}
export interface RatingCategoryListResponse {
    success: boolean;
    data: HackathonRatingCategory[];
    message: string;
}

export interface LeaderboardEntry {
    projectId: string;
    projectTitle: string;
    totalScore: number;
}
export interface LeaderboardResponse {
    success: boolean;
    data: LeaderboardEntry[];
    message: string;
}

const HACKATHON_LIST_TAG = 'HackathonList';
const HACKATHON_DETAILS_TAG = 'HackathonDetails';
const HACKATHON_LEADERBOARD_TAG = 'HackathonLeaderboard';
const HACKATHON_CATEGORIES_TAG = 'HackathonCategories';


export const hackathonApi = createApi({
    reducerPath: 'hackathonApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api/hackathon', // Базовий URL для хакатонів
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),

    tagTypes: [
        HACKATHON_LIST_TAG,
        HACKATHON_DETAILS_TAG,
        HACKATHON_LEADERBOARD_TAG,
        HACKATHON_CATEGORIES_TAG
    ],

    endpoints: (builder) => ({

        // 1. router.post('/', authenticate, hackathonController.createHackathon);
        createHackathon: builder.mutation<HackathonCreateResponse, CreateHackathonDto>({
            query: (body) => ({
                url: '/',
                method: 'POST',
                body: body,
            }),
            invalidatesTags: [HACKATHON_LIST_TAG],
        }),

        // 2. router.put('/:id', authenticate, hackathonController.updateHackathon);
        updateHackathon: builder.mutation<any, { id: string, body: UpdateHackathonDto }>({
            query: ({ id, body }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: HACKATHON_DETAILS_TAG, id },
                HACKATHON_LIST_TAG
            ],
        }),

        // 3. router.delete('/:id', authenticate, hackathonController.deleteHackathon);
        deleteHackathon: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [HACKATHON_LIST_TAG, HACKATHON_DETAILS_TAG],
        }),

        // 4. router.get('/', hackathonController.getAllHackathons);
        getAllHackathons: builder.query<SimpleHackathon[], void>({
            query: () => '/',
            transformResponse: (response: HackathonListResponse) => response.data,
            providesTags: [HACKATHON_LIST_TAG],
        }),

        // 5. router.get('/:id', hackathonController.getHackathonById);
        getHackathonById: builder.query<any, string>({ // Заміни 'any' на HackathonWithDetails
            query: (id) => `/${id}`,
            transformResponse: (response: HackathonDetailsResponse) => response.data,
            providesTags: (result, error, id) => [{ type: HACKATHON_DETAILS_TAG, id }],
        }),

        // 6. router.post('/:id/join', authenticate, hackathonController.joinHackathon);
        joinHackathon: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}/join`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: HACKATHON_DETAILS_TAG, id }],
        }),

        // 7. router.delete('/:id/leave', authenticate, hackathonController.leaveHackathon);
        leaveHackathon: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}/leave`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: HACKATHON_DETAILS_TAG, id }],
        }),

        // 8. router.post('/:id/submit', authenticate, hackathonController.submitProject);
        submitProject: builder.mutation<void, { hackathonId: string, body: SubmitProjectDto }>({
            query: ({ hackathonId, body }) => ({
                url: `/${hackathonId}/submit`,
                method: 'POST',
                body: body,
            }),
            invalidatesTags: (result, error, { hackathonId }) => [
                { type: HACKATHON_DETAILS_TAG, id: hackathonId }
            ],
        }),

        // 9. router.delete('/project/:hpId', authenticate, hackathonController.removeProject);
        removeProject: builder.mutation<void, string>({
            query: (hpId) => ({
                url: `/project/${hpId}`,
                method: 'DELETE',
            }),
            // Не знаючи hackathonId, ми змушені інвалідувати всі детальні теги
            invalidatesTags: [HACKATHON_DETAILS_TAG],
        }),

        // 10. router.post('/project/:hpId/rate', authenticate, hackathonController.rateProject);
        rateProject: builder.mutation<void, { hpId: string, body: RateProjectDto }>({
            query: ({ hpId, body }) => ({
                url: `/project/${hpId}/rate`,
                method: 'POST',
                body: body,
            }),
            // Рейтинг оновлює лідерборд. Також може оновити деталі (напр. середній бал)
            invalidatesTags: [HACKATHON_LEADERBOARD_TAG, HACKATHON_DETAILS_TAG],
        }),

        // 11. router.get('/:id/leaderboard', hackathonController.getLeaderboard);
        getLeaderboard: builder.query<LeaderboardEntry[], string>({
            query: (id) => `/${id}/leaderboard`,
            transformResponse: (response: LeaderboardResponse) => response.data,
            providesTags: (result, error, id) => [{ type: HACKATHON_LEADERBOARD_TAG, id }],
        }),

        // 12. router.get('/categories/themes', hackathonController.getThemeCategories);
        getThemeCategories: builder.query<HackathonThemeCategory[], void>({
            query: () => '/categories/themes',
            transformResponse: (response: ThemeListResponse) => response.data,
            providesTags: [HACKATHON_CATEGORIES_TAG],
        }),

        // 13. router.get('/categories/ratings', hackathonController.getRatingCategories);
        getRatingCategories: builder.query<HackathonRatingCategory[], void>({
            query: () => '/categories/ratings',
            transformResponse: (response: RatingCategoryListResponse) => response.data,
            providesTags: [HACKATHON_CATEGORIES_TAG],
        }),

    }),
});

export const {
    useCreateHackathonMutation,
    useUpdateHackathonMutation,
    useDeleteHackathonMutation,
    useGetAllHackathonsQuery,
    useGetHackathonByIdQuery,
    useJoinHackathonMutation,
    useLeaveHackathonMutation,
    useSubmitProjectMutation,
    useRemoveProjectMutation,
    useRateProjectMutation,
    useGetLeaderboardQuery,
    useGetThemeCategoriesQuery,
    useGetRatingCategoriesQuery,
} = hackathonApi;