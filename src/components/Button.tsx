import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "glass";

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    variant?: Variant;
    disabled?: boolean;
};

const baseStyles = `
  px-6 py-2 rounded-xl font-semibold
  transition-all duration-300
  shadow-md hover:shadow-lg
  focus:outline-none focus:ring-2 focus:ring-offset-2
`;

const variantStyles: Record<Variant, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-300",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-400 focus:ring-red-300",
    ghost: "bg-transparent text-white hover:bg-white/10 focus:ring-white/20 border border-white/20",
    glass: `
        bg-white/10 backdrop-blur-md 
        border border-white/20 
        text-white hover:bg-white/20 
        hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] 
        focus:ring-white/30 
        transition-all duration-300 ease-out
        hover:scale-110
    `,
};

const Button = ({
                    children,
                    onClick,
                    type = "button",
                    className = "",
                    variant = "primary",
                    disabled = false,
                }: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                baseStyles,
                "cursor-pointer",
                variantStyles[variant],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </button>
    );
};

export default Button;
