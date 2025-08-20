import {useCallback, useState} from "react";
import * as authApi from "../api/authApi";
import type {User} from "../../../shared/types/user.ts";

interface UseGetUserReturn {
    getUser: () => Promise<User | null>;
    isLoading: boolean;
    error: string | null;
}

export const useGetUser = (): UseGetUserReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUser = useCallback(async (): Promise<User | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const user = await authApi.getUser();
            return user;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Token not valid';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        getUser,
        isLoading,
        error
    };
};