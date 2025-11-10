// Register.tsx
import { useState, useEffect } from "react";
import DisplayText from "../../../components/DisplayText.tsx";
import DisplayForm from "../../../components/DisplayForm.tsx";
import FormInput from "../../../components/FormInput.tsx";
import Button from "../../../components/Button.tsx";
import SocialButton from "../../../components/SocialButton.tsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import Loading from "../../../components/Loading.tsx";
import ErrorMessage from "../../../components/ErrorMessage.tsx";
import { useRegisterMutation } from "../api/authApi.ts";

const Register = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const navigate = useNavigate();

    const [registerMutation, { isLoading, isError, data, error, isSuccess }] = useRegisterMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password) {
            console.error("Всі поля обов'язкові");
            return;
        }
        registerMutation(form);
    };

    useEffect(() => {
        if (isSuccess && data) {
            localStorage.setItem("token", data.token);
            navigate("/auth/code");
        }
    }, [isSuccess, data, navigate]);

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden items-center justify-center flex p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-5 sm:right-20 size-48 sm:size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-5 sm:left-20 size-48 sm:size-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <DisplayForm onSubmit={handleSubmit} className="relative justify-center w-full max-w-md mx-auto px-4 sm:px-8 py-6 sm:py-10 z-10">
                <DisplayText variant="primary" className="mb-4 text-center text-2xl sm:text-3xl">Привіт!</DisplayText>
                <DisplayText variant="secondary" className="text-center text-sm sm:text-base mb-6">Ми дуже раді тебе бачити</DisplayText>

                <FormInput
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    type="text"
                    placeholder="Ім'я користувача"
                    required
                    className="mb-4"
                />
                <FormInput
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    required
                    className="mb-4"
                />
                <FormInput
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Пароль"
                    required
                    className="mb-6"
                />

                {isLoading && <Loading text="Реєстрація..." />}
                {isError && (
                    <ErrorMessage
                        message={(error as any)?.data?.message || (error as any)?.message || "Помилка реєстрації"}
                        title="Не вдалося зареєструватися"
                    />
                )}

                <Button variant="primary" type="submit" className="w-full py-3 text-base sm:text-lg">Зареєструватися</Button>

                <DisplayText variant="secondary" className="mt-6 text-center text-sm sm:text-base">
                    або увійди через
                </DisplayText>

                <div className="mt-4 flex justify-center">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            try {
                                const res = await axios.post(import.meta.env.VITE_API_BASE_URL + 'auth/google', {
                                    idToken: credentialResponse.credential,
                                });
                                const { token } = res.data;
                                localStorage.setItem('token', token);
                                navigate("/");
                            } catch (err) {
                                console.error('Google Login Error:', err);
                            }
                        }}
                        onError={() => console.log('Login Failed')}
                        useOneTap
                    />
                </div>

                <SocialButton
                    provider="github"
                    className="mt-4 w-full"
                    onClick={() =>
                        window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liJuqLlwYgqwEX9W&scope=user:email&redirect_uri=${window.location.origin}/auth/github/`
                    }
                />

                <DisplayText variant="secondary" className="mt-6 text-center text-sm sm:text-base">
                    Вже маєш акаунт? <a href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">Увійти</a>
                </DisplayText>
            </DisplayForm>
        </div>
    );
};

export default Register;