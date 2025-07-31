// router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login.tsx";

export const router = createBrowserRouter([
    //{ path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    //{ path: "/register", element: <Register /> },
    //{ path: "/projects", element: <Projects /> },
    //{ path: "/projects/:id", element: <ProjectDetail /> },
    //{ path: "/dashboard", element: <Dashboard /> },
    //{ path: "/dashboard/create", element: <CreateProject /> },
    //{ path: "/dashboard/edit/:id", element: <EditProject /> },
    //{ path: "/profile/:userId", element: <Profile /> },
    //{ path: "*", element: <NotFound /> },
]);
