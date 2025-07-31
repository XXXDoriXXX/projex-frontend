import React from "react";

//Michroma
// Quicksand
//Varela Round
//Bitcount Prop Double


type DisplayFormProps = {

    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
};

function DisplayForm({ onSubmit,children, className = "" }: DisplayFormProps) {
    return (
        <form
        onSubmit={onSubmit}
        className={`backdrop-blur-sm border border-white/50 bg-white/5 p-8 rounded-2xl shadow-xl w-full max-w-sm ${className}`}
        >
            {children}
        </form>
    );
}

export default DisplayForm;
