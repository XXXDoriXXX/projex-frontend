import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "glass";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: Variant;
};


const baseStyles = `
  font-semibold
  transition-all duration-300
  shadow-md hover:shadow-lg
  focus:outline-none focus:ring-2 focus:ring-offset-2
  flex items-center justify-center gap-2
  rounded-full
`;

const variantStyles: Record<Variant, string> = {
    primary: `
  px-10 py-4 
  text-lg tracking-wide 
  glow-pulse 
  bg-[linear-gradient(135deg,_rgb(124,58,237),_rgba(24,47,255,0.6))] 
  bg-[length:200%_200%] 
  text-white 
  isolation-auto z-10 
  shadow-[0_0_40px_rgba(124,58,237,0.4),0_0_80px_rgba(139,92,246,0.3),0_8px_32px_rgba(0,0,0,0.3)] 
  animate-[glow-pulse_3s_ease-in-out_infinite_alternate] 
  transition-[transform,box-shadow] duration-400 
  [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)]
  hover:translate-y-[-4px] hover:scale-[1.01] 
  hover:shadow-[0_0_60px_rgba(124,58,237,0.2),0_0_120px_rgba(139,92,246,0.2),0_0_180px_rgba(109,40,217,0.2),0_12px_40px_rgba(0,0,0,0.4),0_2px_inset_rgba(255,255,255,0.4),0_-2px_inset_rgba(0,0,0,0.3)]
`
    ,
    secondary: `
      px-6 py-2
      bg-neutral-800/70 backdrop-blur-sm
      border border-white/10
      text-neutral-200
      hover:bg-neutral-700/90 hover:text-white
      focus:ring-white/20
      hover:scale-105
    `,
    danger: `
      px-6 py-2
      bg-red-600/90 backdrop-blur-sm
      border border-red-500/30
      text-white
      shadow-[0_0_15px_rgba(239,68,68,0.3)]
      hover:bg-red-600
      hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]
      focus:ring-red-400/50
      hover:scale-105
    `,
    ghost: `
      px-4 py-2
      bg-transparent 
      backdrop-blur-md
      border border-white/20 
      text-white 
      hover:bg-white/10 
      hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
      focus:ring-white/30
      transition-all duration-300 ease-out
      hover:scale-105
    `,
    glass: `
        px-6 py-2
        bg-white/10 backdrop-blur-md 
        border border-white/20 
        text-white hover:bg-white/20 
        hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] 
        focus:ring-white/30 
        transition-all duration-300 ease-out
        hover:scale-110
    `,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
         children,
         className = "",
         variant = "primary",
         type = "button",
         ...props
     }, ref) => {
        return (
            <button
                type={type}
                className={clsx(
                    baseStyles,
                    "cursor-pointer",
                    variantStyles[variant],
                    className,
                    props.disabled && "opacity-50 cursor-not-allowed",
                )}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export default Button;