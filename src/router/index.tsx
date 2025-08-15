// router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login.tsx";
import Register from "../pages/Register.tsx";
import Code from "../pages/Code.tsx";
import GithubCallback from "../features/auth/GithubCallback.tsx";

export const router = createBrowserRouter([
    //{ path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/code", element: <Code /> },
    { path: "/auth/github/callback", element: <GithubCallback  /> },
    //{ path: "/projects", element: <Projects /> },
    //{ path: "/projects/:id", element: <ProjectDetail /> },
    //{ path: "/dashboard", element: <Dashboard /> },
    //{ path: "/dashboard/create", element: <CreateProject /> },
    //{ path: "/dashboard/edit/:id", element: <EditProject /> },
    //{ path: "/profile/:userId", element: <Profile /> },
    //{ path: "*", element: <NotFound /> },
]);
