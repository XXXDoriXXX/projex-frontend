import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
// --- NEW: Імпортуємо authApi та тип User ---
import { authApi } from "./api/authApi.ts";
import type {User} from "../../shared/types/user.ts";
// (Припускаю, що тип User лежить тут, виправте шлях якщо ні)


export interface AuthState{
    token: string | null;
    user: User | null; // <-- NEW: Додано поле user
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    user: null, // <-- NEW: Початковий стан для user
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
            state.user = null; // <-- NEW: Очищуємо user при виході
            localStorage.removeItem("token");
        },
        // (Опціонально) Ред'юсер для ручного встановлення user
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        }
    },
    // --- NEW: Автоматично оновлюємо стан на основі authApi ---
    extraReducers: (builder) => {
        builder
            // Коли login успішний, зберігаємо токен
            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, { payload }) => {
                    state.token = payload.token;
                    localStorage.setItem("token", payload.token);
                    // Примітка: ваш login повертає лише токен.
                    // Вам потрібно буде викликати getProfile окремо (напр. в App.tsx),
                    // щоб отримати дані користувача.
                }
            )
            // Коли register успішний, він повертає User (згідно вашого authApi)
            .addMatcher(
                authApi.endpoints.register.matchFulfilled,
                (state, { payload }) => {
                    // Ви можете встановити користувача, але зазвичай
                    // після реєстрації потрібен логін
                    state.user = payload;
                }
            )
            // Коли getProfile успішний, зберігаємо дані користувача
            .addMatcher(
                authApi.endpoints.getProfile.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload; // payload - це об'єкт User
                }
            )
            // Якщо getProfile не вдався (напр. токен недійсний), виходимо
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