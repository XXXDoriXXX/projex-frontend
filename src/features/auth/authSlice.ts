import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { loginApi } from "./api/authApi";
import type {User} from "../../shared/types/user.ts";

// Типи

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

// Початковий стан
const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};

// Асинхронні thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            return await loginApi(credentials);
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.error = null;
        },
        clearUser(state) {
            state.user = null;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;