// Code.tsx
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
            setDisplayError({ data: { message: "Будь ласка, введіть 6-значний код." } });
            return;
        }
        setDisplayError(null);
        const token = localStorage.getItem("token");
        if (!token) {
            setDisplayError({ data: { message: "Токен відсутній. Увійдіть знову." } });
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
            setDisplayError({ data: { message: "Токен відсутній. Увійдіть знову." } });
            navigate("/auth/login");
            return;
        }
        sendCode({ token });
    };

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden items-center justify-center flex flex-col p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-5 sm:right-20 size-48 sm:size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-5 sm:left-20 size-48 sm:size-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <DisplayForm onSubmit={handleSubmit} className="relative justify-center w-full max-w-md mx-auto px-4 sm:px-8 py-6 sm:py-10 z-10">
                <DisplayText variant="primary" className="mb-4 text-center text-2xl sm:text-3xl">
                    Підтвердження Email
                </DisplayText>
                <DisplayText variant="secondary" className="mb-6 text-center text-sm sm:text-base">
                    Ми відправили 6-значний код на ваш email. Введіть його нижче.
                </DisplayText>

                <div className="flex justify-center mb-6">
                    <OTPInput value={code} onChange={setCode} />
                </div>

                {(isVerifying || isResending) && <Loading text={isVerifying ? "Перевірка..." : "Відправка..."} />}
                {displayError && (
                    <ErrorMessage
                        message={(displayError as any)?.data?.message || (displayError as any)?.message || "Сталася невідома помилка."}
                        title="Помилка підтвердження"
                        onDismiss={() => setDisplayError(null)}
                    />
                )}

                <Button
                    variant="primary"
                    type="submit"
                    className="w-full mt-4 py-3 text-base sm:text-lg"
                    disabled={isVerifying || isResending}
                >
                    Підтвердити
                </Button>

                <div className="mt-6 text-center text-sm sm:text-base text-muted-foreground">
                    Не отримали код?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || isResending}
                        className={`underline font-semibold transition-colors ${resendTimer > 0 || isResending
                            ? "cursor-not-allowed text-muted-foreground opacity-50"
                            : "cursor-pointer text-primary/80 hover:text-primary"
                        }`}
                    >
                        {resendTimer > 0 ? `Відправити знову через ${resendTimer}с` : isResending ? "Відправка..." : "Відправити код"}
                    </button>
                </div>
            </DisplayForm>
        </div>
    );
};

export default Code;