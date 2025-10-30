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
import ProjectLayout from "../ProjectLayout.tsx";
import ProjectView from "../features/project/pages/ProjectView.tsx";
import {EditProjectPage} from "../features/project/pages/EditProjectPage.tsx";
import CreateHackathonPage from "../features/hackathons/pages/CreateHackathonPage.tsx";
import HackathonPage from "../features/hackathons/pages/HackathonPage.tsx";
import EditHackathonPage from "../features/hackathons/pages/EditHackathonPage.tsx";
import HackathonListPage from "../features/hackathons/pages/HackathonListPage.tsx";
import ProjectListPage from "../features/project/pages/ProjectListPage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { path: "/", element: <Home /> },
            {path: "/profile/:username", element: <Profile/>},

        ],
    },
    {
        path: "/project",
        element: <ProjectLayout />,
        children: [
            { path: "create", element: <CreateProject/> },
            { path: "view/:id", element: <ProjectView />},
            { path: "edit/:projectId", element: <EditProjectPage />},
            { path: "explore", element: <ProjectListPage />},

        ],
    },
    {
        path: "/hackathon",
        element: <ProjectLayout />,
        children: [
            { path: "create", element: <CreateHackathonPage/> },
            { path: "view/:id", element: <HackathonPage />},
            { path: "edit/:id", element: <EditHackathonPage />},
            { path: "explore", element: <HackathonListPage />},
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
