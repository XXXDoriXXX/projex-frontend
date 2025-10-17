import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authApi } from "./features/auth/api/authApi.ts";
import authReducer from "./features/auth/authSlice.ts";
import {userApi} from "./features/profile/api/userApi.ts";
import {projectApi} from "./features/project/api/projectApi.ts";

const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    auth: authReducer,

});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .concat(authApi.middleware)
                .concat(userApi.middleware)
                .concat(projectApi.middleware),
    });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];