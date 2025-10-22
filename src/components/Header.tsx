import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../assets/img/logo.png";
import Button from "./Button.tsx";
import { useNavigate } from "react-router-dom";
import { MotionEffect } from "./Animations/Motion/Motion-effect.tsx";
import { useSelector } from "react-redux";
import type { RootState } from "../store.ts";
import { useGetProfileQuery } from "../features/auth/api/authApi.ts";
import Loading from "./Loading.tsx";

const navItems = ["Feed", "Explore", "Profile", "Notifications"];

const Header = () => {
    const token = useSelector((state: RootState) => state.auth.token);

    const navigate = useNavigate();
    const [active, setActive] = useState("Feed");
    const [hovered, setHovered] = useState<string | null>(null);
    const [highlightProps, setHighlightProps] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: user, isLoading, isError, isFetching } = useGetProfileQuery(token!, {
        skip: !token, // Skip fetching if there's no token
    });

    const updateHighlight = (label: string) => {
        const container = containerRef.current;
        if (!container) return;
        const el = container.querySelector<HTMLAnchorElement>(`[data-label="${label}"]`);
        if (el) {
            const { offsetLeft, offsetWidth } = el;
            setHighlightProps({ left: offsetLeft, width: offsetWidth });
        }
    };

    useEffect(() => {
        updateHighlight(active);
    }, [active]);

    const displayUserContent = user && (
        <>
            <img
                src={user.avatarUrl || "/default-avatar.png"}
                alt={`${user.username} avatar`}
                className="h-10 w-10 rounded-full cursor-pointer object-cover border-2 border-white/50 group-hover:border-white group-hover:scale-130 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300"
                onClick={() => navigate("/profile/" + user.username)}
            />
            <span className="text-white font-semibold">{user.username}</span>
        </>
    );

    const displayLoginContent = (
        <Button className={""} variant="glass" onClick={() => navigate("/auth/login")}>
            Sign in
        </Button>
    );

    return (
        <header
            className="
                max-w-full
                fixed top-0 inset-x-4 md:inset-x-0 z-50
                bg-gradient-to-b from-[#060010] via-[#060010]/80 to-transparent
             py-4
            "
        >
            <div className="max-w-6/10 mx-auto flex items-center justify-between h-20 ">
                {/* Лого */}
                <div className="relative flex items-center gap-3">
                    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#160010]/50 via-[#160010]/20 to-transparent pointer-events-none blur-3xl"></div>
                    <img
                        src={logo}
                        alt="Projex Logo"
                        className="relative h-12 w-auto object-contain select-none drop-shadow-lg transition-transform duration-500 hover:scale-115"
                    />
                </div>

                {/* Навігація з "мандрівним" об'єктом */}
                <nav
                    ref={containerRef}
                    className="relative hidden md:flex items-center gap-8 text-gray-300 font-semibold backdrop-blur-sm rounded-4xl border border-white/20 p-4 shadow-lg bg-[rgba(6,0,16,0.25)]   transition-all duration-500  hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] "
                >
                    {/* Highlight */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-white/30 p-6 blur-md  transition-transform duration-500 z-0 inset-shadow-sm "
                        animate={{
                            left: highlightProps.left,
                            width: highlightProps.width,
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 45 }}
                    />

                    {navItems.map((item) => (
                        <a
                            key={item}
                            data-label={item}
                            href="#"
                            className="relative px-3 py-1 z-10 cursor-pointer transition-colors duration-300 hover:text-white"
                            onClick={() => setActive(item)}
                            onMouseEnter={() => {
                                setHovered(item);
                                updateHighlight(item);
                            }}
                            onMouseLeave={() => {
                                setHovered(null);
                                updateHighlight(active);
                            }}
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                {/* Кнопка / Аватар */}
                <MotionEffect slide={{ direction: 'right' }} fade zoom inView delay={0.5}>
                    <div className="
                        group
                        cursor-pointer
                        flex items-center gap-4
                        backdrop-blur-sm
                        rounded-full
                        border border-white/20
                        p-3
                        shadow-lg
                        bg-[linear-gradient(135deg,#7c3aed,#182fff99)]
                        bg-[length:200%_200%]
                        transition-all duration-500
                        hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]">

                        {isLoading || isFetching ? (
                            <Loading message="Loading..." />
                        ) : isError ? (
                            displayLoginContent
                        ) : token ? (
                            displayUserContent
                        ) : (
                            displayLoginContent
                        )}
                    </div>
                </MotionEffect>
            </div>
        </header>
    );
};

export default Header;