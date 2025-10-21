import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

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
    endpoints: (builder) => ({
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
        }),
    }),
});
export const { useCreateProjectMutation, useGetTechnologiesQuery } = projectApi;