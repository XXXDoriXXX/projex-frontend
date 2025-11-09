import { useState, useEffect } from "react";
import DisplayText from "../../../components/DisplayText.tsx";
import DisplayForm from "../../../components/DisplayForm.tsx";
import FormInput from "../../../components/FormInput.tsx";
import Button from "../../../components/Button.tsx";
import SocialButton from "../../../components/SocialButton.tsx";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {GoogleLogin} from "@react-oauth/google";
import Loading from "../../../components/Loading.tsx";
import ErrorMessage from "../../../components/ErrorMessage.tsx";
import {useRegisterMutation} from "../api/authApi.ts";

const Register = () => {
    const [form, setForm] = useState({ username:"",email: "", password: "" });
    const navigate = useNavigate();

    const [registerMutation, { isLoading, isError, data, error, isSuccess }] = useRegisterMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password) {
            console.error("All fields are required");
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
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-pink-500/10 rounded-full blur-3xl" />


            <div className="relative z-10 flex items-center justify-center w-full max-w-6xl">

                <DisplayForm onSubmit={handleSubmit} >
                    <DisplayText variant="primary" className="mb-4">Hello!</DisplayText>
                    <DisplayText variant="secondary">We are really happy to see you</DisplayText>
                    <FormInput
                        name={"username"}
                        value={form.username}
                        onChange={handleChange}
                        type="text"
                        placeholder="Username"
                        required
                        className="mb-6 mt-2"/>
                    <FormInput
                        name={"email"}
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="Email"
                        required
                        className="mb-6 mt-2"/>
                    <FormInput
                        name={"password"}
                        value={form.password}
                        onChange={handleChange}
                        type={"password"}
                        placeholder="Password"
                        required
                        className="mb-6 mt-2"
                    />

                    {isLoading && <Loading text="Registering..." />}
                    {isError && (
                        <ErrorMessage
                            message={(error as any)?.data?.message || (error as any)?.message || "Registration failed"}
                            title="Registration Failed"
                        />
                    )}

                    <Button variant={"primary"} type={"submit"} className={"w-full"}>Register</Button>

                    <DisplayText variant="secondary" className="mt-4">
                        or sign up with
                    </DisplayText>
                    <div className={"mt-4"}>
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
                        className="mt-4"
                        onClick={() =>
                            window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liJuqLlwYgqwEX9W&scope=user:email&redirect_uri=${window.location.origin}/auth/github/`
                        }
                    />
                    <DisplayText variant="secondary" className="mt-4">
                        Already have an account? <a href="/auth/login" className="text-blue-300 hover:text-blue-200">Login</a>
                    </DisplayText>
                </DisplayForm>
            </div>
        </div>
    );
};

export default Register;