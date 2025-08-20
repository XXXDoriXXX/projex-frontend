import { Outlet } from "react-router-dom";
import {GoogleOAuthProvider} from "@react-oauth/google";

const AuthLayout = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Outlet />
            </GoogleOAuthProvider>
        </div>
    );
};

export default AuthLayout;
