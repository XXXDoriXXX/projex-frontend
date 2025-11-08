import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {DetailedProject, Project, ProjectDetailsResponse} from "../../../shared/types/Project.ts";

interface ProjectCreateBody {
    title: string;
    description: string;
    githubUrl?: string;
    demoUrl?: string;
    mediaIds?: string[];
    technologies: string[];
}
interface UpdateProjectDto {
    title?: string;
    description?: string;
    githubUrl?: string;
    demoUrl?: string;
    mediaIds?: string[];
    technologies?: string[];
    subauthorIds?: string[];
    previewId?: string | null;
}
export interface ChangeVisibilityResponse {
    success: boolean;
    data: {
        privateLinkToken: string | null;
    };
    message: string;
}
export type ProjectVisibility = 'link' | 'public' | 'private';
interface UploadMediaData {
    id: string;
    url: string;
    type: 'image' | 'video';
}
interface UploadMediaResponse {
    success: boolean;
    data: UploadMediaData;
    message: string;
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
export interface ProjectListParams {
    cursor?: string;
    search?: string;
    technologies?: string[];
    authorId?: string;
    sortBy?: 'popular' | 'newest';
    limit?: number;
}
export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export interface ProjectListResponse {
    success: boolean;
    data: Project[];
    nextCursor: string | null;
    message?: string;
}

export interface TransformedProjectResponse {
    projects: Project[];
    nextCursor: string | null;
}
export interface TechnologyResponse {
    success: boolean;
    data: Technology[];
    message: string;
}
export interface MyProjectsResponse {
    success: boolean;
    data: Project[];
    message: string;
}
const PROJECT_TAG = 'ProjectDetails';
export const USER_PROJECTS_TAG = 'UserProjects';
const PROJECT_LIST_TAG = 'ProjectList';

export const projectApi = createApi({
    reducerPath: 'projectApi',
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

    tagTypes: [PROJECT_TAG, 'Technology', USER_PROJECTS_TAG, PROJECT_LIST_TAG],
    endpoints: (builder) => ({

        addView: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `project/view/${projectId}`,
                method: 'POST',
            }),

            invalidatesTags: (result, error, projectId) => [{ type: PROJECT_TAG, id: projectId }],
        }),
        updateProject: builder.mutation<void, { id: string, body: UpdateProjectDto }>({
            query: ({ id, body }) => ({
                url: `project/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: PROJECT_TAG, id },
                PROJECT_LIST_TAG,
                USER_PROJECTS_TAG
            ],
        }),
        uploadMedia: builder.mutation<UploadMediaResponse, FormData>({
            query: (formData) => ({
                url: 'project/upload-media',
                method: 'POST',
                body: formData,

            }),

        }),
        getProjects: builder.query<TransformedProjectResponse, ProjectListParams>({
            query: (params) => ({
                url: 'project/',
                method: 'GET',
                params: {
                    search: params.search || undefined,
                    technologies: params.technologies && params.technologies.length > 0 ? params.technologies : undefined,
                    authorId: params.authorId || undefined,
                    cursor: params.cursor || undefined,
                    limit: params.limit || 9,
                },
            }),
            transformResponse: (response: ProjectListResponse) => ({
                projects: response.data,
                nextCursor: response.nextCursor,
            }),
            serializeQueryArgs: ({ queryArgs }) => {
                const { cursor, limit, ...filterArgs } = queryArgs;
                return JSON.stringify(filterArgs);
            },
            merge: (currentCache, newItems, { arg }) => {
                if (!arg?.cursor) {

                    currentCache.projects = newItems.projects;
                } else {

                    const existingIds = new Set(currentCache.projects.map(p => p.id));
                    const uniqueNewProjects = newItems.projects.filter(
                        p => !existingIds.has(p.id)
                    );
                    currentCache.projects.push(...uniqueNewProjects);
                }
                currentCache.nextCursor = newItems.nextCursor;
            },
            forceRefetch({ currentArg, previousArg }) {

                return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
            },
            providesTags: [PROJECT_LIST_TAG],
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
            invalidatesTags: [USER_PROJECTS_TAG, PROJECT_LIST_TAG]
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
        getMyProjects: builder.query<Project[], string>({
            query: (userId) => `project/user/${userId}`,
            transformResponse: (response: MyProjectsResponse) => response.data,
            providesTags: (result, error, userId) => [{ type: USER_PROJECTS_TAG, id: userId }],
        }),
        updateProjectStatus: builder.mutation<void, { id: string, status: ProjectStatus }>({
            query: ({ id, status }) => ({
                url: `project/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: PROJECT_TAG, id },
                PROJECT_LIST_TAG,
                USER_PROJECTS_TAG
            ],
        }),
        changeProjectVisibility: builder.mutation<ChangeVisibilityResponse, { id: string, visibility: ProjectVisibility }>({
            query: ({ id, visibility }) => ({
                url: `project/visible/${id}`,
                method: 'PATCH',
                body: { visible: visibility },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: PROJECT_TAG, id },
                PROJECT_LIST_TAG,
            ],
        }),
    }),
});

export const {
    useCreateProjectMutation,
    useGetTechnologiesQuery,
    useGetProjectDetailsQuery,
    useAddViewMutation,
    useLikeProjectMutation,
    useUnlikeProjectMutation,
    useGetMyProjectsQuery,
    useGetProjectsQuery,
    useLazyGetProjectsQuery,
    useUpdateProjectMutation,
    useUploadMediaMutation,
    useUpdateProjectStatusMutation,
    useChangeProjectVisibilityMutation,
} = projectApi;