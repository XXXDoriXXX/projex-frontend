import { useState, useEffect } from "react";
import DisplayText from "../../../components/DisplayText.tsx";
import DisplayForm from "../../../components/DisplayForm.tsx";
import Button from "../../../components/Button.tsx";
import OTPInput from "../../../components/OTPInput.tsx";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../authSlice.ts";
import type { AppDispatch } from "../../../store.ts";
import Loading from "../../../components/Loading.tsx";
import ErrorMessage from "../../../components/ErrorMessage.tsx";
import { useVerifyEmailMutation, useSendVerificationCodeMutation } from "../api/authApi.ts";


const RESEND_TIMEOUT = 60;

const Code = () => {
    const [code, setCode] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>()

    const [verifyEmail, {
        isLoading: isVerifying,
        isError: isVerifyError,
        error: verifyError,
        isSuccess: isVerifySuccess,
    }] = useVerifyEmailMutation();

    const [sendCode, {
        isLoading: isResending,
        isError: isResendError,
        error: resendError,
        isSuccess: isResendSuccess
    }] = useSendVerificationCodeMutation();

    const [displayError, setDisplayError] = useState<any | null>(null);


    useEffect(() => {
        if (resendTimer === 0) return;
        const timerId = setInterval(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [resendTimer]);

    useEffect(() => {
        if (isVerifySuccess) {
            const finalToken = localStorage.getItem("token");

            if (finalToken) {
                dispatch(setToken(finalToken));

                navigate("/");
            } else {
                navigate("/auth/login");
            }
        }
    }, [isVerifySuccess, dispatch, navigate]);
    useEffect(() => {
        if (isResendSuccess) {
            setResendTimer(RESEND_TIMEOUT);
            setDisplayError(null);
            console.log("Verification code resent!");
        }
    }, [isResendSuccess]);


    useEffect(() => {
        if (isVerifyError) {
            setDisplayError(verifyError);
        } else if (isResendError) {
            setDisplayError(resendError);
        }
    }, [isVerifyError, isResendError, verifyError, resendError]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length !== 6) {
            setDisplayError({ data: { message: "Please enter a valid 6-digit code." } });
            return;
        }

        setDisplayError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setDisplayError({ data: { message: "Authentication token is missing. Please log in again." } });
            navigate("/auth/login");
            return;
        }

        verifyEmail({ code, token });
    };

    const handleResend = () => {
        if (resendTimer > 0 || isResending) return;

        setDisplayError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setDisplayError({ data: { message: "Authentication token is missing. Please log in again." } });
            navigate("/auth/login");
            return;
        }

        sendCode({ token });
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
                {(isVerifying || isResending) && <Loading text={isVerifying ? "Verifying..." : "Resending..."} />}
                {displayError && (
                    <ErrorMessage
                        message={(displayError as any)?.data?.message || (displayError as any)?.message || "An unknown error occurred."}
                        title="Verification failed"
                        onDismiss={() => setDisplayError(null)}
                    />
                )}

                <Button
                    variant="primary"
                    type="submit"
                    className="w-full mt-4"
                    disabled={isVerifying || isResending}
                >
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