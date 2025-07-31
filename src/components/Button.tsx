import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

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
