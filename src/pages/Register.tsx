import { useState } from "react";
import DisplayText from "../components/DisplayText.tsx";
import DisplayForm from "../components/DisplayForm.tsx";
import FormInput from "../components/FormInput.tsx";
import Button from "../components/Button.tsx";
import SocialButton from "../components/SocialButton.tsx";
import logo from "../assets/img/logo.png";
import {useNavigate} from "react-router-dom";
import axios from "axios";
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
        }
    };

    type RegisterResponse = {
        token: string;
    }

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
            </div>1
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
                <Button variant={"primary"} type={"submit"} className={"w-full"}>Register</Button>

                <DisplayText variant="secondary" className="mt-4">
                    or sign up with
                </DisplayText>
                <SocialButton
                    provider={"google"}
                    className="mt-4"/>
                <SocialButton
                    provider={"github"}
                    className="mt-4"
                    onClick={()=> console.log("Register with GitHub")}
                />
                <DisplayText variant="secondary" className="mt-4">
                    Already have an account? <a href="/login" className="text-blue-300 hover:text-blue-200">Login</a>
                </DisplayText>
            </DisplayForm>
        </div>
    );
};

export default Register;
