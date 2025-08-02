import { useState, useEffect } from "react";
import DisplayText from "../components/DisplayText.tsx";
import DisplayForm from "../components/DisplayForm.tsx";
import Button from "../components/Button.tsx";
import OTPInput from "../components/OTPInput.tsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RESEND_TIMEOUT = 60; // секунд

const Code = () => {
    const [code, setCode] = useState("");
    const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();


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
            await axios.post(`http://localhost:3000/api/auth/verify-email/${code}`);
            navigate("/");
        } catch (err) {
            console.error("Verification Error:", err);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return; // Забороняємо клік, поки таймер не вийде

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
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 xl:p-32 bg-[url(./assets/img/bg1.jpg)] bg-cover bg-center">
            <DisplayForm onSubmit={handleSubmit}>
                <DisplayText variant="primary" className="mb-4">
                    Email verification
                </DisplayText>
                <DisplayText variant="secondary" className="mb-4">
                    We sent a 6-digit code to your email. Enter it below.
                </DisplayText>

                <OTPInput value={code} onChange={setCode} />

                <Button variant="primary" type="submit" className="w-full mt-4">
                    Confirm
                </Button>

                <div className="mt-4 text-center text-sm text-gray-500">
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || isResending}
                        className={`underline font-semibold ${
                            resendTimer > 0 || isResending ? "cursor-not-allowed opacity-50" : "cursor-pointer"
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
