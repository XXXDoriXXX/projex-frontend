import React from "react";

type Variant = "primary" | "secondary" | "success" | "danger" | "warning" | "info";
//Michroma
// Quicksand
//Varela Round
//font-['Bitcount Prop Double']

const variantClasses: Record<Variant, string> = {
    primary: "font-['Quicksand'] text-white text-shadow-md text-5xl font-bold",
    secondary: "text-gray-300 font-['Varela Round'] text-shadow-md",
    success: "text-green-400 hover:text-green-300",
    danger: "text-red-400 hover:text-red-300",
    warning: "text-yellow-300 hover:text-yellow-200",
    info: "text-cyan-400 hover:text-cyan-300",
};

type DisplayTextProps = {
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
};

function DisplayText({ children, variant = "secondary", className = "" }: DisplayTextProps) {
    return (
        <div className={`text-center ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
}

export default DisplayText;
