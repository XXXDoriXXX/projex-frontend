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
  px-6 py-2 font-semibold
  transition-all duration-300
  shadow-md hover:shadow-lg
  focus:outline-none focus:ring-2 focus:ring-offset-2
`;

const variantStyles: Record<Variant, string> = {
    primary: `
  glow-pulse 
  bg-[linear-gradient(135deg,_rgb(124,58,237),_rgba(24,47,255,0.6))] 
  bg-[length:200%_200%] 
  text-white 
  rounded-full 
  px-10 py-4 
  font-semibold text-lg tracking-wide 
  flex items-center justify-between gap-6 
  isolation-auto z-10 
  shadow-[0_0_40px_rgba(124,58,237,0.4),0_0_80px_rgba(139,92,246,0.3),0_8px_32px_rgba(0,0,0,0.3)] 
  animate-[glow-pulse_3s_ease-in-out_infinite_alternate] 
  transition-[transform,box-shadow] duration-400 
  [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)]
  hover:translate-y-[-4px] hover:scale-[1.01] 
  hover:shadow-[0_0_60px_rgba(124,58,237,0.2),0_0_120px_rgba(139,92,246,0.2),0_0_180px_rgba(109,40,217,0.2),0_12px_40px_rgba(0,0,0,0.4),0_2px_inset_rgba(255,255,255,0.4),0_-2px_inset_rgba(0,0,0,0.3)]
`
    ,
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-400 focus:ring-red-300",
    ghost: "bg-transparent text-white hover:bg-white/10 focus:ring-white/20 border border-white/20 hover:scale-110    rounded-full",
    glass: `
        bg-white/10 backdrop-blur-md 
        border border-white/20 
        text-white hover:bg-white/20 
        hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] 
        focus:ring-white/30 
        transition-all duration-300 ease-out
        hover:scale-110
        rounded-full
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
                className,
                variantStyles[variant],
                disabled && "opacity-50 cursor-not-allowed",

            )}
        >
            {children}
        </button>
    );
};

export default Button;
