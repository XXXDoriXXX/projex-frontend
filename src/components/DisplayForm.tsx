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
        className={`bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl min-h-[600px] flex flex-col ${className}`}
        >
            {children}
        </form>
    );
}

export default DisplayForm;
