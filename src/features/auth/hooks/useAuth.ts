import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/redux';
import { login, setUser, clearUser } from '../authSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading, error } = useAppSelector(state => state.auth);

    const handleLogin = useCallback(async (email: string, password: string) => {
        return dispatch(login({ email, password })).unwrap();
    }, [dispatch]);

    const handleLogout = useCallback(() => {
        dispatch(clearUser());
        // Тут також можна виконати додаткові дії при виході, наприклад, API запит
    }, [dispatch]);

    const manuallySetUser = useCallback((userData: typeof user) => {
        if (userData) dispatch(setUser(userData));
    }, [dispatch]);

    return {
        user,
        isLoading,
        error,
        login: handleLogin,
        logout: handleLogout,
        setUser: manuallySetUser,
    };
};