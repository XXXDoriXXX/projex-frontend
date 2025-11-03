import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import { authApi } from "./api/authApi.ts";
import type {User} from "../../shared/types/user.ts";


export interface AuthState{
    token: string | null;
    user: User | null;
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    user: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
            localStorage.setItem("token", action.payload);
        },
        logout(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
        },

        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder

            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, { payload }) => {
                    state.token = payload.token;
                    localStorage.setItem("token", payload.token);
                }
            )
            .addMatcher(
                authApi.endpoints.register.matchFulfilled,
                (state, { payload }) => {

                    state.user = payload;
                }
            )
            .addMatcher(
                authApi.endpoints.getProfile.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload;
                }
            )
            .addMatcher(
                authApi.endpoints.getProfile.matchRejected,
                (state, action) => {
                    // (action.payload as any) - перевірте структуру помилки
                    if ((action.payload as any)?.status === 401) {
                        state.token = null;
                        state.user = null;
                        localStorage.removeItem("token");
                    }
                }
            );
    },
})

export const {setToken, logout, setUser} = authSlice.actions;
export default authSlice.reducer;