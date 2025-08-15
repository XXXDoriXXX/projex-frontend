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
                bg-[rgba(6,0,16,0.25)]
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
