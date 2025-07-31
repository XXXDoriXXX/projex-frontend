
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormInputProps = {
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
};

const FormInput = ({
                       type = "text",
                      name,
                       value,
                       onChange,
                       placeholder = "",
                       className = "",
                       required = false,
                   }: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    return (
        <div className="relative">
        <input
            type={isPassword && showPassword ? "text":type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`block w-full px-4 py-3
        border border-gray-400/30
        rounded-xl
        bg-gray-300/10
        text-white placeholder-gray-400
        font-['Varela Round']
        focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent
        transition duration-300 ease-in-out
        shadow-sm focus:shadow-lg
        ${className}`}
        />
            {isPassword && (
            <button
                type={"button"}
                onClick={() => setShowPassword((prev) => !prev)}
                className={"absolute top-1/2 right-4 transform -translate-y-1/2 text-white/70 hover:text-white transition"}
                tabIndex={-1}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            )}
        </div>
    );
};

export default FormInput;
