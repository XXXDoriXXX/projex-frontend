import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../components/Button.tsx";
import Header from "../components/Header.tsx";
import DisplayDiv from "../components/DisplayDiv.tsx";
import ProjectCard from "../components/ProjectCard.tsx";

const Home = () => {
    const [user, setUser] = useState<{ username: string; avatar?: string } | null>(null);

    useEffect(() => {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
            try {
                const userData = JSON.parse(rawUser);
                setUser(userData);
            } catch (err) {
                console.warn("Помилка при парсингу user з localStorage:", err);
            }
        }

        const fetchUser = async () => {
            try {
                const res = await axios.post(
                    "http://localhost:3000/api/auth/me",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const userData = res.data;
                console.log("Fetched User:", userData);
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
            } catch (err) {
                console.error("Registration Error:", err);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="min-h-screen flex items-center bg-[url(./assets/img/bg1.jpg)] bg-cover bg-center text-white px-6">

            <Header user={user} />
            <DisplayDiv className={"max-w-9xl w-full flex flex-col md:flex-row justify-between items-center"}>
                {/* Ліва частина: текст + кнопка */}
                <div className="flex-1 mb-12 md:mb-0">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Showcase your code. <br /> Connect. <br /> Grow.
                    </h1>
                    <p className="text-gray-400 mb-8">
                        ProjeX is a social network for developers where your projects become your portfolio.
                    </p>
                    {!user ? (
                        <Button variant={"glass"}>Get Started</Button>
                    ) : (
                        <Button variant={"primary"} onClick={() => alert("Redirect to projects")}>
                            Explore Projects
                        </Button>
                    )}
                </div>

                {/* Права частина: популярні проекти */}
                <div className="flex-1 w-full md:w-auto">
                    <h2 className="text-2xl font-semibold mb-6">Popular Projects</h2>
                    <div className="space-y-4">
                        <ProjectCard
                            title="DevConnector"
                            tags={["Node.js", "React", "MongoDB"]}
                            stars={112}
                        />
                        <ProjectCard
                            title="Chat Application"
                            tags={["TypeScript", "Next.js", "TailwindCSS"]}
                            stars={89}
                        />
                        <ProjectCard
                            title="Portfolio Website"
                            tags={["HTML", "CSS", "JavaScript"]}
                            stars={76}
                        />
                    </div>
                </div>
            </DisplayDiv>

            <small className="absolute bottom-4 text-white/60 font-mono tracking-widest animate-pulse">
                Made with ♥ by Котик
            </small>
        </div>
    );
};

export default Home;
