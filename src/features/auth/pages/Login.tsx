// Login.tsx
import { useState, useEffect } from "react";
import DisplayText from "../../../components/DisplayText.tsx";
import DisplayForm from "../../../components/DisplayForm.tsx";
import FormInput from "../../../components/FormInput.tsx";
import Button from "../../../components/Button.tsx";
import SocialButton from "../../../components/SocialButton.tsx";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import Loading from "../../../components/Loading.tsx";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ErrorMessage.tsx";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store.ts";
import { setToken } from "../authSlice.ts";
import { useLoginMutation } from "../api/authApi.ts";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [loginMutation, { isLoading, isError, data, error, isSuccess }] = useLoginMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            console.error("Всі поля обов'язкові");
            return;
        }

        loginMutation({
            email: form.email,
            password: form.password,
        });
    };

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setToken(data.token));
            navigate("/");
        }
    }, [isSuccess, data, dispatch, navigate]);

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden items-center justify-center flex flex-col p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-5 sm:right-20 size-48 sm:size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-5 sm:left-20 size-48 sm:size-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <DisplayForm onSubmit={handleSubmit} className="relative justify-center w-full max-w-md mx-auto px-4 sm:px-8 py-6 sm:py-10">
                <DisplayText variant="primary" className="mb-4 text-center text-2xl sm:text-3xl">Привіт!</DisplayText>
                <DisplayText variant="secondary" className="text-center text-sm sm:text-base">Ми дуже раді бачити тебе знову</DisplayText>

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
                        window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liJuqLlwYgqwEX9W&scope=user:email&redirect_uri=https://projex-frontend-hazel.vercel.app/auth/github`
                    }
                />

                <DisplayText variant="secondary" className="relative flex py-5 items-center text-sm sm:text-base">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="flex-shrink mx-4 text-gray-400">або увійди через</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                </DisplayText>

                <FormInput
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    required
                    className="mb-4 mt-2"
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

                {isLoading && <Loading text="Вхід..." />}
                {isError && <ErrorMessage message={error} defaultMessage="Невірні дані" />}

                <Button variant="primary" type="submit" className="w-full mt-6 py-3 text-base sm:text-lg">Увійти</Button>

                <DisplayText variant="secondary" className="mt-4 text-center text-sm sm:text-base">
                    Ще не маєш акаунту? <a href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">Зареєструватися</a>
                </DisplayText>
            </DisplayForm>
        </div>
    );
};

export default Login;