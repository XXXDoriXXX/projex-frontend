import { useRef } from "react";

type OTPInputProps = {
    value: string;
    onChange: (val: string) => void;
    length?: number;
};

const OTPInput = ({ value, onChange, length = 6 }: OTPInputProps) => {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value.replace(/\D/, "").slice(0, 1);
        const nextValue = value.split("");
        nextValue[index] = val;
        const joined = nextValue.join("").padEnd(length, "");
        onChange(joined);

        if (val && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-3 mb-6 mt-2">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleInputChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-12 h-14 text-center text-xl rounded-lg border border-white/30 bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150"
                />
            ))}
        </div>
    );
};

export default OTPInput;
