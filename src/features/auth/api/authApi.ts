import type {User} from "../../../shared/types/user.ts";
import axios from "axios";
import ApiService from "../../../shared/services/ApiService.ts";


interface LoginCredentials {
    email: string;
    password: string;
}
type LoginResponse = {
    token: string;
};
type GetUserResponse = {
    user: User;
}

export const getUser = async(): Promise<User> => {
    try {
        const res = await ApiService.get<GetUserResponse>('/api/me');
        return res.data.user;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorData = error.response.data;
            throw new Error(errorData.message || 'Failed to fetch user data');
        }
        throw new Error('An unexpected error occurred while fetching user data');
    }
}

export const login = async (credentials: LoginCredentials) => {
try{
    const res = await ApiService.post<LoginResponse>('/api/login', credentials);
    const data = res.data;
    localStorage.setItem('token', data.token);
    return data.token;
}
catch(error){
    if(axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || 'Login failed');
    }
    throw new Error('An unexpected error occurred during login');
}
};

export const register = async (userData: {
    username: string;
    email: string;
    password: string;
}): Promise<User> => {
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
    }

    return response.json();
};