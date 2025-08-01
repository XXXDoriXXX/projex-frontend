import type {JSX} from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import clsx from "clsx";

type Provider = "google" | "github";

type SocialButtonProps = {
    provider: Provider;
    onClick?: () => void;
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

    return (
        <button
            onClick={onClick}
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
