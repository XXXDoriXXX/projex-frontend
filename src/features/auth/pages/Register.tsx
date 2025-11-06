
import { useState } from "react";
import DisplayText from "../../../components/DisplayText.tsx";
import DisplayForm from "../../../components/DisplayForm.tsx";
import FormInput from "../../../components/FormInput.tsx";
import Button from "../../../components/Button.tsx";
import SocialButton from "../../../components/SocialButton.tsx";
import logo from "../../../assets/img/logo_small.png";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import DisplayDiv from "../../../components/DisplayDiv.tsx";
import {GoogleLogin} from "@react-oauth/google";

const Register = () => {
    const [form, setForm] = useState({ username:"",email: "", password: "" });
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password) {
            console.error("All fields are required");
            return;
        }
        try {
            const res = await axios.post<RegisterResponse>(
                "http://localhost:3000/api/auth/register",
                form
            );
            const { token } = res.data;
            localStorage.setItem("token", token);
            navigate("/code");
        } catch (err) {
            console.error("Registration Error:", err);
            // TODO: Додати компонент ErrorMessage, як в Login.tsx
        }
    };

    type RegisterResponse = {
        token: string;
    }

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden items-center justify-center flex p-4">

            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-pink-500/10 rounded-full blur-3xl" />

            {/* Внутрішній контейнер, що центрує обидві колонки */}
            <div className="relative z-10 flex items-center justify-center w-full max-w-6xl">

                {/* Ліва частина (як у вас і була) */}
                <DisplayDiv className={"hidden xl:block flex flex-col max-w-max mr-16"}>
                    <DisplayText variant={"primary"} className={"text-7xl font-bold leading-tight "}>
                        Share yourself
                    </DisplayText>
                    <img src = {logo} alt="Projex Logo" className="w-auto h-auto mb-4" />

                    <DisplayText variant={"secondary"} className="mb-6 text-3xl">
                        Show the world your ideas and projects.
                        Create a portfolio, find like-minded people, and grow together.
                    </DisplayText>
                </DisplayDiv>

                {/* Права частина (Форма) */}
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
                    {/* TODO: Додати сюди <Loading /> та <ErrorMessage /> як в Login.tsx */}
                    <Button variant={"primary"} type={"submit"} className={"w-full"}>Register</Button>

                    <DisplayText variant="secondary" className="mt-4">
                        or sign up with
                    </DisplayText>
                    <div className={"mt-4"}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    const res = await axios.post('http://localhost:3000/api/auth/google', {
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
                            window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liJuqLlwYgqwEX9W&scope=user:email&redirect_uri=http://localhost:5173/auth/github/callback`
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