
import { Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthHeader from "./components/AuthHeader.tsx";

const AuthLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <AuthHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Outlet />
                </main>
            </GoogleOAuthProvider>
        </div>
    );
};

export default AuthLayout;