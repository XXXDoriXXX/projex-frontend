import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
interface LoginResponse {
    token: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

export const authAPI = createApi({
    reducerPath: "authAPI",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/auth" }),
    endpoints: (build) => ({
        fetchAuth: build.mutation<LoginResponse, LoginRequest>({
            query: ({ email, password }) => ({
                url: "/login",
                method: "POST",
                body: { email, password },
            }),
        }),
    }),
});
