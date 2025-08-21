import axios from "axios";

const ApiService = axios.create({
    baseURL: import.meta.env.API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
ApiService.interceptors.request.use(
    (config) => {
       const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
ApiService.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            console.error('Unauthorized access - redirecting to login');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)
export default ApiService