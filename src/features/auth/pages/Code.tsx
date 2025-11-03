
import { useState, useEffect } from "react";
import DisplayText from "../../../components/DisplayText.tsx";
import DisplayForm from "../../../components/DisplayForm.tsx";
import Button from "../../../components/Button.tsx";
import OTPInput from "../../../components/OTPInput.tsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../authSlice.ts";
import type { AppDispatch } from "../../../store.ts";

const RESEND_TIMEOUT = 60; // секунд

const Code = () => {
    const [code, setCode] = useState("");
    const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        if (resendTimer === 0) return;
        const timerId = setInterval(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [resendTimer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            console.error("Please enter a valid 6-digit code.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            await axios.post(`http://localhost:3000/api/auth/verify-email/${code}` ,{}, {headers: {
                    Authorization: `Bearer ${token}`,
                },}, );

            dispatch(setToken(token));
            localStorage.removeItem("token");
            navigate("/");

        } catch (err) {
            console.error("Verification Error:", err);
            // TODO: Додати компонент ErrorMessage, як в Login.tsx
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setIsResending(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }
            await axios.post("http://localhost:3000/api/auth/send-verification-code" ,{}, {headers: {
                    Authorization: `Bearer ${token}`,
                },}, );
            setResendTimer(RESEND_TIMEOUT);
            console.log("Verification code resent!");
        } catch (err) {
            console.error("Error resending verification code:", err);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden items-center justify-center flex flex-col p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-pink-500/10 rounded-full blur-3xl" />

            <DisplayForm onSubmit={handleSubmit} className={"relative justify-center "}>
                <DisplayText variant="primary" className="mb-4">
                    Email verification
                </DisplayText>
                <DisplayText variant="secondary" className="mb-4">
                    We sent a 6-digit code to your email. Enter it below.
                </DisplayText>

                <OTPInput value={code} onChange={setCode} />

                {/* TODO: Додати сюди <Loading /> та <ErrorMessage /> як в Login.tsx */}

                <Button variant="primary" type="submit" className="w-full mt-4">
                    Confirm
                </Button>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || isResending}
                        className={`underline font-semibold transition-colors ${
                            resendTimer > 0 || isResending
                                ? "cursor-not-allowed text-muted-foreground opacity-50"
                                : "cursor-pointer text-primary/80 hover:text-primary"
                        }`}
                    >
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : isResending ? "Resending..." : "Resend code"}
                    </button>
                </div>
            </DisplayForm>
        </div>
    );
};

export default Code;