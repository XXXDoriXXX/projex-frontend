import type {JSX} from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import clsx from "clsx";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

type Provider = "google" | "github";

type SocialButtonProps = {
    provider: Provider;
    onClick?: () => void; // для GitHub або кастомного
    className?: string;
};

const providerInfo: Record<Provider, { label: string; icon: JSX.Element; bg: string }> = {
    google: {
        label: "Enter with Google",
        icon: <FcGoogle size={20} />,
        bg: "bg-white text-gray-800 hover:bg-gray-100",
    },
    github: {
        label: "Enter with GitHub",
        icon: <FaGithub size={20} />,
        bg: "bg-gray-900 text-white hover:bg-gray-800",
    },
};

const SocialButton = ({ provider, onClick, className = "" }: SocialButtonProps) => {
    const { label, icon, bg } = providerInfo[provider];

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post("http://localhost:3000/api/auth/google", {
                    idToken: tokenResponse.access_token,
                });
                const { token } = res.data;
                localStorage.setItem("token", token);
                // TODO: редірект або зміна auth стейту
            } catch (err) {
                console.error("Google Login Error:", err);
            }
        },
        onError: () => console.error("Google Login Failed"),
        flow: "implicit", // або 'auth-code' — залежить від бекенду
    });

    const handleClick = () => {
        if (provider === "google") {
            loginWithGoogle(); // Google login flow
        } else if (onClick) {
            onClick(); // GitHub or others
        }
    };

    return (
        <button
            onClick={handleClick}
            type="button"
            className={clsx(
                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition",
                bg,
                className
            )}
        >
            {icon}
            {label}
        </button>
    );
};

export default SocialButton;
