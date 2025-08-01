import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register.tsx";
import Code from "./pages/Code.tsx";

const App = () => {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path={ "/register" } element={<Register />} />
            <Route path={"/code"} element={<Code/>}/>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </GoogleOAuthProvider>
    );
};

export default App;
