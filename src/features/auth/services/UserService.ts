import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { IUser } from "../models/IUser.ts";

export const userAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:3000/api/auth/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (build) => ({
        fetchUser: build.query<IUser, void>({
            query: () => ({
                url: "/me",
                method: "GET",
            }),
        }),
    }),
});

export const { useFetchUserQuery } = userAPI;
