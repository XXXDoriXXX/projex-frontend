import logo from "../assets/img/logo.png";
import Button from "./Button.tsx";
import {useNavigate} from "react-router-dom";

type User = {
    username: string;
    avatarUrl?: string;
};

type HeaderProps = {
    user: User | null;
};

const Header = ({ user }: HeaderProps) => {
    const navigate = useNavigate();
    return (
        <header className="fixed top-4 inset-x-4 md:inset-x-8 z-50 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl transition-all duration-700 ease-in-out hover:scale-[1.01] hover:shadow-2xl">
            <div className="max-w-9xl mx-auto flex items-center justify-between h-20 px-4 sm:px-6 md:px-10">
                {/* Лого */}
                <div className="flex items-center gap-3 animate-fade-in">
                    <img
                        src={logo}
                        alt="Projex Logo"
                        className="h-12 w-auto object-contain select-none drop-shadow-[0_2px_4px_rgba(255,255,255,0.25)] transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Навігація */}
                <nav className="hidden md:flex items-center gap-10 text-gray-300 font-semibold animate-fade-in delay-100">
                    {["Feed", "Explore", "Profile", "Notifications"].map((item, idx) => (
                        <a
                            key={idx}
                            href="#"
                            className="relative group transition-colors duration-300 ease-in-out hover:text-white"
                        >
                            {item}
                            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </nav>

                {/* Кнопка / Аватар */}
                <div className="animate-fade-in delay-200 flex items-center gap-4">
                    {user ? (
                        <>

                            {/* Аватарка з hover cursor */}
                            <img
                                src={user.avatarUrl || "/default-avatar.png"}
                                alt={`${user.username} avatar`}
                                className="h-10 w-10 rounded-full cursor-pointer object-cover border-2 border-white/50 hover:border-white transition-all"
                                onClick={() => alert("Відкриваємо профіль користувача")}
                            />
                                {/* Ім'я користувача */}
                                <span className="text-white font-semibold">
                                {user.username}
                            </span>

                        </>
                    ) : (
                        <Button variant="glass" onClick={() => navigate("/login")}>
                            Sign in
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
