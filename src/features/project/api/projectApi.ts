import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {DetailedProject, ProjectDetailsResponse} from "../../../shared/types/Project.ts";

interface ProjectCreateBody {
    title: string;
    description: string;
    githubUrl?: string;
    demoUrl?: string;
    mediaIds?: string[];
    technologies: string[];
}
interface ProjectCreateResponse {
    success: boolean;
    data: { id: string; title: string };
    message: string;
}
export interface Technology {
    id: string;
    name: string;
}

export interface TechnologyResponse {
    success: boolean;
    data: Technology[];
    message: string;
}

const PROJECT_TAG = 'ProjectDetails';

export const projectApi = createApi({
    reducerPath: 'projectApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),

    tagTypes: [PROJECT_TAG, 'Technology'],
    endpoints: (builder) => ({

        addView: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `project/view/${projectId}`,
                method: 'POST',
            }),

            invalidatesTags: (result, error, projectId) => [{ type: PROJECT_TAG, id: projectId }],
        }),

        likeProject: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `project/like/${projectId}`,
                method: 'POST',
            }),

            invalidatesTags: (result, error, projectId) => [{ type: PROJECT_TAG, id: projectId }],
        }),
        unlikeProject: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `project/like/${projectId}`,
                method: 'DELETE',
            }),

            invalidatesTags: (result, error, projectId) => [{ type: PROJECT_TAG, id: projectId }],
        }),

        createProject: builder.mutation<ProjectCreateResponse, ProjectCreateBody>({
            query: (projectData) => ({
                url: 'project/create',
                method: 'POST',
                body: projectData,
            }),
        }),

        getTechnologies: builder.query<Technology[], void>({
            query: () => 'project/technology',
            transformResponse: (response: TechnologyResponse) => response.data,
            providesTags: ['Technology'],
        }),


        getProjectDetails: builder.query<DetailedProject, string>({
            query: (projectId) => `project/get/${projectId}`,
            transformResponse: (response: ProjectDetailsResponse) => response.data,

            providesTags: (result, error, projectId) => [{ type: PROJECT_TAG, id: projectId }],
        }),
    }),
});

export const {
    useCreateProjectMutation,
    useGetTechnologiesQuery,
    useGetProjectDetailsQuery,
    useAddViewMutation,
    useLikeProjectMutation,
    useUnlikeProjectMutation
} = projectApi;