import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {userAPI} from "./features/auth/services/UserService.ts";
import {authAPI} from "./features/auth/services/AuthService.ts";

const rootReducer = combineReducers({
    [userAPI.reducerPath]: userAPI.reducer,
    [authAPI.reducerPath]: authAPI.reducer,
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(userAPI.middleware)
        .concat(authAPI.middleware),
    })
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];