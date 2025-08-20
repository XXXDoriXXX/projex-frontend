import {useCallback, useState} from "react";
import * as authApi from "../api/authApi";

interface UseLoginReturn {
    login: (email: string, password: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

export const useLogin = (): UseLoginReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await authApi.login({email, password});
            return !!response;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        login,
        isLoading,
        error
    };
};