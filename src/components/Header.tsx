
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/img/logo_small.png";
import Button from "./Button.tsx";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store.ts";
import { useGetProfileQuery } from "../features/auth/api/authApi.ts";

import { ArrowLeft, Search, PlusCircle, Menu, X } from "lucide-react";

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

    return (
        <Link to={to} className="relative px-3 py-1 z-10 cursor-pointer text-gray-200 transition-colors duration-300 hover:text-white">
            {children}
            {isActive && (
                <motion.div
                    layoutId="nav-highlight"
                    className="absolute inset-0 rounded-full bg-white/10 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </Link>
    );
};

const MobileNavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick: () => void }) => {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="text-gray-200 hover:text-white transition-colors py-2 text-lg"
        >
            {children}
        </Link>
    );
};


const Header = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    const { data: user, isLoading, isFetching, isError } = useGetProfileQuery(token!, {
        skip: !token,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isMinimalPage = /^\/(project|hackathon)\/(view|edit)\/.+/.test(pathname);

    const isProjectSection = pathname.startsWith('/project');
    const isHackathonSection = pathname.startsWith('/hackathon');

    const handleSearchSubmit = () => {
        if (!searchTerm.trim()) return;

        let targetPath = '/project/explore';

        if (isProjectSection) {
            targetPath = '/project/explore';
        } else if (isHackathonSection) {
            targetPath = '/hackathon/explore';
        }

        navigate(`${targetPath}?search=${encodeURIComponent(searchTerm.trim())}`);

        setSearchTerm('');
        setIsMobileMenuOpen(false);
    };

    const renderUserControls = () => {
        if (isLoading || isFetching) {
            return (
                <div className="flex items-center gap-2 p-1 rounded-full bg-white/10 animate-pulse">
                    <div className="h-9 w-9 rounded-full bg-white/20"></div>
                </div>
            );
        }
        if (isError || !token) {
            return (
                <Button className="py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105" variant="glass" onClick={() => navigate("/auth/login")}>
                    Sign in
                </Button>
            );
        }
        if (user) {
            return (
                <motion.div
                    className="group cursor-pointer flex items-center gap-3 p-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => navigate("/profile/" + user.username)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <img
                        src={user.avatarUrl || "/default-avatar.png"}
                        alt={`${user.username} avatar`}
                        className="h-9 w-9 rounded-full object-cover border-2 border-white/70 group-hover:border-white transition-all duration-300"
                    />
                    <span className="text-white font-semibold hidden md:block pr-2">{user.username}</span>
                </motion.div>
            );
        }
        return null;
    };

    const renderContextActions = () => {
        let createPath = "";
        let createText = "";

        if (isProjectSection) {
            createPath = "/project/create";
            createText = "Створити Проект";
        } else if (isHackathonSection) {
            createPath = "/hackathon/create";
            createText = "Створити Хакатон";
        }

        if (!createPath) return null;

        return (
            <Button
                variant="primary"
                className="hidden md:flex items-center gap-2 rounded-full py-2 px-4 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate(createPath)}
            >
                <PlusCircle className="size-5" />
                {createText}
            </Button>
        );
    };

    const renderSearchField = (isMobile = false) => (
        <div className={`relative items-center flex-1 ${isMobile ? 'flex sm:hidden' : 'hidden sm:flex'} max-w-xs ${isMobile ? '' : 'mx-4'}`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
                type="text"
                placeholder="Пошук..."
                className="w-full bg-black/30 border border-gray-700 rounded-full py-2 px-4 pl-10 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSearchSubmit();
                    }
                }}
            />
        </div>
    );


    if (isMinimalPage) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Button
                    variant="glass"
                    className="fixed top-5 left-5 z-999 rounded-full p-2 aspect-square flex items-center justify-center shadow-lg h-8"
                    onClick={() => navigate(-1)}
                    aria-label="Повернутись назад"
                >
                    <ArrowLeft className="size-5" />
                </Button>
            </motion.div>
        );
    }

    return (
        <>
            <header
                className="
                    fixed top-0 inset-x-0 z-40
                    bg-gray-950/50 backdrop-blur-lg
                    border-b border-white/10
                    shadow-md
                "
            >
                <div className="container mx-auto flex items-center justify-between h-16 px-4">
                    {/* Лого */}
                    <Link to="/" className="flex-shrink-0">
                        <motion.img
                            src={logo}
                            alt="Projex Logo"
                            className="h-24 w-auto object-contain select-none"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        />
                    </Link>

                    <nav
                        className="relative hidden md:flex items-center gap-2 text-gray-300 font-semibold
                                    bg-white/5 rounded-full border border-white/10 p-2 shadow-sm"
                    >
                        <NavLink to="/">Дім</NavLink>
                        <NavLink to="/project/explore">Проекти</NavLink>
                        <NavLink to="/hackathon/explore">Хакатони</NavLink>
                    </nav>

                    <div className="flex-1" />

                    {renderSearchField()}
                    {renderContextActions()}

                    <div className="flex-shrink-0 ml-4">
                        {renderUserControls()}
                    </div>

                    <div className="md:hidden flex-shrink-0 ml-2">
                        <Button
                            variant="glass"
                            className="p-2 rounded-full"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Відкрити меню"
                        >
                            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden bg-gray-950/80 backdrop-blur-md border-t border-white/10 shadow-lg overflow-hidden"
                        >
                            <div className="flex flex-col p-4 gap-4">

                                {renderSearchField(true)}

                                <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Дім</MobileNavLink>
                                <MobileNavLink to="/project/explore" onClick={() => setIsMobileMenuOpen(false)}>Проекти</MobileNavLink>
                                <MobileNavLink to="/hackathon/explore" onClick={() => setIsMobileMenuOpen(false)}>Хакатони</MobileNavLink>

                                {(isProjectSection || !isHackathonSection) && (
                                    <Button
                                        variant="primary"
                                        className="w-full flex items-center justify-center gap-2 rounded-full py-2 px-4 text-sm font-medium"
                                        onClick={() => {
                                            navigate("/project/create");
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <PlusCircle className="size-5" />
                                        Створити Проект
                                    </Button>
                                )}
                                {isHackathonSection && (
                                    <Button
                                        variant="primary"
                                        className="w-full flex items-center justify-center gap-2 rounded-full py-2 px-4 text-sm font-medium"
                                        onClick={() => {
                                            navigate("/hackathon/create");
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <PlusCircle className="size-5" />
                                        Створити Хакатон
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
};

export default Header;