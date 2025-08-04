import React from "react";

interface DisplayDivProps {
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    children: React.ReactNode;
    className?: string;
}

const DisplayDiv = ({ children, className = "" }: DisplayDivProps) => {
    return (
        <div
            className={`
                bg-white/10 
                backdrop-blur-md 
                border border-white/30 
                rounded-3xl 
                p-8 
                shadow-2xl 
                transition-all 
                duration-700 
                ease-out 
               
                hover:shadow-glow 
                animate-fade-in 
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default DisplayDiv;
