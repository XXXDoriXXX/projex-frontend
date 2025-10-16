import { createBrowserRouter } from "react-router-dom";
import Home from "../features/home/pages/Home.tsx";
import Login from "../features/auth/pages/Login.tsx";
import Register from "../features/auth/pages/Register.tsx";
import GithubCallback from "../features/auth/GithubCallback.tsx";
import AppLayout from "../AppLayout.tsx";
import AuthLayout from "../AuthLayout.tsx";
import CreateProject from "../features/project/pages/CreateProject.tsx";
import Code from "../features/auth/pages/Code.tsx";
import Profile from "../features/profile/pages/Profile.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/project/create", element: <CreateProject/> },
            {path: "/profile/:username", element: <Profile/>},

        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            {path: "code",element: <Code />},
            { path: "github", element: <GithubCallback /> },
        ]
    },
]);
