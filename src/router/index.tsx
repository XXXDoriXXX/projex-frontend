import { createBrowserRouter } from "react-router-dom";
import Home from "../features/home/pages/Home.tsx";
import Login from "../features/auth/pages/Login.tsx";
import Register from "../features/auth/pages/Register.tsx";
import GithubCallback from "../features/auth/GithubCallback.tsx";
import AppLayout from "../AppLayout.tsx";
import AuthLayout from "../AuthLayout.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { path: "/", element: <Home /> },

        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "github/callback", element: <GithubCallback /> },
        ]
    },
]);
