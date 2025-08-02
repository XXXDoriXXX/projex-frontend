import { useState } from "react";
import DisplayText from "../components/DisplayText.tsx";
import DisplayForm from "../components/DisplayForm.tsx";
import FormInput from "../components/FormInput.tsx";
import Button from "../components/Button.tsx";
import SocialButton from "../components/SocialButton.tsx";
import logo from "../assets/img/logo.png";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    type LoginResponse = {
        token: string;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
            if (!form.email || !form.password) {
                console.error("All fields are required");
                return;
            }
            try {
                const res = await axios.post<LoginResponse>(
                    "http://localhost:3000/api/auth/login",
                    form
                );
                const { token } = res.data;
                localStorage.setItem("token", token);
                navigate("/");
            } catch (err) {
                console.error("Registration Error:", err);
            }


        console.log("Login with:", form);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 xl:p-32 bg-[url(./assets/img/bg1.jpg)] bg-cover bg-center">

            <div className=" hidden xl:block flex flex-col max-w-max text-white bg-white/10 rounded-xl p-8 mr-30 shadow-lg backdrop-blur-md border border-white/50 ">
                <DisplayText variant={"primary"} className={"text-7xl font-bold leading-tight "}>
                    Share yourself
                </DisplayText>
                <img src = {logo} alt="Projex Logo" className="w-auto h-auto mb-4" />

                <DisplayText variant={"secondary"} className="mb-6 text-3xl">
                    Show the world your ideas and projects.
                    Create a portfolio, find like-minded people, and grow together.
                </DisplayText>
            </div>
            <DisplayForm onSubmit={handleSubmit} >
                <DisplayText variant="primary" className="mb-4">Hello!</DisplayText>
                <DisplayText variant="secondary">We are really happy to see you aggain</DisplayText>
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
                <Button variant={"primary"} type={"submit"} className={"w-full"}>Login</Button>

                <DisplayText variant="secondary" className="mt-4">
                    or sign in with
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
                    onClick={() => console.log("Login with GitHub")}
                />
                <DisplayText variant="secondary" className="mt-4">
                    Don't have an account? <a href="/register" className="text-blue-300 hover:text-blue-200">Register</a>
                </DisplayText>
            </DisplayForm>
        </div>
    );
};

export default Login;
