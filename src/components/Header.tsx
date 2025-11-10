import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/img/logo_small.png";
import Button from "./Button.tsx";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store.ts";
import { useGetProfileQuery } from "../features/auth/api/authApi.ts";

import { ArrowLeft, Search, PlusCircle, Menu, X, Home, Layers, Trophy } from "lucide-react";

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

    return (
        <Link to={to} className="relative px-3 py-2 z-10 cursor-pointer text-gray-300 font-medium transition-colors duration-300 hover:text-white">
            {children}
            {isActive && (
                <motion.div
                    layoutId="nav-highlight"
                    className="absolute inset-0 rounded-full bg-white/10 z-[-1]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </Link>
    );
};

const mobileMenuVariants = {
    closed: { opacity: 0, y: "-100%", transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05, staggerDirection: -1 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1, delayChildren: 0.2 } }
};

const mobileItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
};

const MobileNavLink = ({ to, children, onClick, icon: Icon }: { to: string, children: React.ReactNode, onClick: () => void, icon: any }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
    return (
        <motion.div variants={mobileItemVariants}>
            <Link to={to} onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                <Icon className={`size-6 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-xl font-semibold tracking-wide">{children}</span>
            </Link>
        </motion.div>
    );
};

const Header = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    const { data: user, isLoading, isFetching, isError } = useGetProfileQuery(token!, { skip: !token });

    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    const isMinimalPage = /^\/(project|hackathon)\/(view|edit)\/.+/.test(pathname);
    const isProjectSection = pathname.startsWith('/project');
    const isHackathonSection = pathname.startsWith('/hackathon');

    const handleSearchSubmit = () => {
        if (!searchTerm.trim()) return;
        let targetPath = isHackathonSection ? '/hackathon/explore' : '/project/explore';
        navigate(`${targetPath}?search=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
        setIsMobileMenuOpen(false);
    };

    const renderUserControls = () => {
        if (isLoading || isFetching) return <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 animate-pulse"><div className="h-9 w-9 rounded-full bg-white/10" /></div>;
        if (isError || !token) return <Button className="py-2 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95" variant="glass" onClick={() => navigate("/auth/login")}>Увійти</Button>;
        if (user) return (
            <motion.div className="cursor-pointer flex items-center gap-3 p-1 lg:pr-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300" onClick={() => navigate("/profile/" + user.username)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <img src={user.avatarUrl || "/default-avatar.png"} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
                <span className="text-white font-medium text-sm hidden lg:block truncate max-w-[100px]">{user.username}</span>
            </motion.div>
        );
        return null;
    };

    const renderContextActions = (isMobile = false) => {
        let createPath = "", createText = "";
        if (isProjectSection) { createPath = "/project/create"; createText = "Створити Проект"; }
        else if (isHackathonSection) { createPath = "/hackathon/create"; createText = "Створити Хакатон"; }

        if (!createPath) return null;

        if (isMobile) return (
            <motion.div variants={mobileItemVariants} className="w-full">
                <Button variant="primary" className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold shadow-lg shadow-primary/20" onClick={() => { navigate(createPath); setIsMobileMenuOpen(false); }}>
                    <PlusCircle className="size-6" /> {createText}
                </Button>
            </motion.div>
        );

        return (
            <Button variant="primary" className="hidden h-12 md:flex items-center gap-2 rounded-full py-2 px-3 lg:px-4 text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300" onClick={() => navigate(createPath)} title={createText}>
                <PlusCircle className="size-5" />
                <span className="hidden lg:inline">{createText}</span>
            </Button>
        );
    };

    if (isMinimalPage) return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Button variant="glass" className="fixed top-6 left-6 z-50 rounded-full p-3 aspect-square flex items-center justify-center shadow-xl backdrop-blur-xl border border-white/20 hover:border-white/40" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-5" />
            </Button>
        </motion.div>
    );

    return (
        <>
            <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${isScrolled || isMobileMenuOpen ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 shadow-sm py-2' : 'bg-transparent py-4'}`}>

                <div className="container mx-auto flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between px-4 md:px-6 gap-4">

                    <div className="flex justify-start">
                        <Link to="/" className="flex-shrink-0 relative z-50" onClick={() => setIsMobileMenuOpen(false)}>
                            <motion.img src={logo} alt="Projex Logo" className="h-15 w-auto object-contain" whileHover={{ scale: 1.55, rotate: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center justify-center gap-1 bg-white/5 rounded-full p-1.5 border border-white/10 backdrop-blur-md justify-self-center">
                        <NavLink to="/">Головна</NavLink>
                        <NavLink to="/project/explore">Проекти</NavLink>
                        <NavLink to="/hackathon/explore">Хакатони</NavLink>
                    </nav>

                    <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4">
                        <div className="hidden md:flex relative items-center max-w-[140px] lg:max-w-[200px] xl:max-w-xs transition-all duration-300 focus-within:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                            <input type="text" placeholder="Пошук..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()} />
                        </div>

                        {renderContextActions()}
                        <div className="hidden md:block">{renderUserControls()}</div>

                        <motion.button className="md:hidden relative z-50 p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} whileTap={{ scale: 0.9 }} aria-label="Toggle menu">
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X className="size-6" /></motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu className="size-6" /></motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial="closed" animate="open" exit="closed" variants={mobileMenuVariants} className="fixed inset-0 z-30 bg-[#0a0a0a] flex flex-col pt-24 px-6 pb-8 md:hidden overflow-y-auto">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                        <div className="flex flex-col gap-6 flex-1 relative z-10">
                            <motion.div variants={mobileItemVariants} className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input type="text" placeholder="Що шукаємо?" className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()} />
                            </motion.div>
                            <nav className="flex flex-col gap-2 mt-4">
                                <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)} icon={Home}>Головна</MobileNavLink>
                                <MobileNavLink to="/project/explore" onClick={() => setIsMobileMenuOpen(false)} icon={Layers}>Проекти</MobileNavLink>
                                <MobileNavLink to="/hackathon/explore" onClick={() => setIsMobileMenuOpen(false)} icon={Trophy}>Хакатони</MobileNavLink>
                            </nav>
                        </div>
                        <div className="flex flex-col gap-4 mt-auto relative z-10">
                            {renderContextActions(true)}
                            <motion.div variants={mobileItemVariants} className="pt-6 border-t border-white/10">
                                {user ? (
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl" onClick={() => { navigate("/profile/" + user.username); setIsMobileMenuOpen(false); }}>
                                        <img src={user.avatarUrl || "/default-avatar.png"} alt={user.username} className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500/30" />
                                        <div>
                                            <div className="text-white font-semibold text-lg">{user.username}</div>
                                            <div className="text-gray-400 text-sm">Переглянути профіль</div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="glass" className="w-full py-4 text-lg rounded-2xl font-semibold" onClick={() => { navigate("/auth/login"); setIsMobileMenuOpen(false); }}>Увійти в акаунт</Button>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;