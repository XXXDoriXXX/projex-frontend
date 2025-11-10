
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Layers, Trophy, Users, Code, CheckCircle, Network, Rocket } from 'lucide-react';

import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import ProjectCard from '../../../components/ProjectCard';
import HackathonCard from '../../../features/hackathons/components/hackathon/HackathonCard';

import { useGetProjectsQuery } from '../../project/api/projectApi';
import { useGetTechnologiesQuery } from '../../project/api/projectApi';
import { useGetHackathonsQuery } from '../../hackathons/api/hackathonApi';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
            <HeroSection />
            <StatsSection />
            <FeaturedProjectsSection />
            <TechSection />
            <HowItWorksSection />
            <FeaturedHackathonsSection />
            <CTASection />
            <Footer />
        </div>
    );
};
const HeroSection = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        navigate(`/project/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <section className="relative w-full h-screen flex items-center justify-center text-center px-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 z-0" />
            <div className="absolute top-20 right-20 size-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <motion.div
                className="relative z-10 flex flex-col items-center gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white"
                    variants={itemVariants}
                >
                    Знайди. Створи. Перемагай.
                </motion.h1>
                <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl" variants={itemVariants}>
                    Платформа, де ваші ідеї перетворюються на реальні проекти та знаходять визнання.
                </motion.p>

                <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                    <Button
                        variant="primary"
                        className="py-3 px-6 text-lg rounded-full"
                        onClick={() => navigate('/project/create')}
                    >
                        <Rocket className="size-5 mr-2" />
                        Створити Проект
                    </Button>
                    <Button
                        variant="secondary"
                        className="py-3 px-6 text-lg rounded-full"
                        onClick={() => navigate('/hackathon/explore')}
                    >
                        <Trophy className="size-5 mr-2" />
                        Пошук Хакатонів
                    </Button>
                </motion.div>

                <motion.div className="relative w-full max-w-lg mt-4" variants={itemVariants}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Шукайте проекти за назвою або технологією..."
                        className="w-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-full py-3 px-5 pl-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        aria-label="Пошук проектів"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

const StatsSection = () => {
    const stats = [
        { icon: Layers, value: "1,500+", label: "Опублікованих Проектів" },
        { icon: Trophy, value: "50+", label: "Проведених Хакатонів" },
        { icon: Users, value: "3,000+", label: "Активних Розробників" },
    ];

    return (
        <section className="py-20 bg-card/30 border-y border-border/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center p-6 bg-card/50 rounded-2xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <stat.icon className="size-10 text-primary mb-3" />
                            <div className="text-4xl font-bold">{stat.value}</div>
                            <p className="text-muted-foreground mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeaturedProjectsSection = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useGetProjectsQuery({ limit: 3 });

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <motion.h2
                    className="text-4xl font-bold text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Найкращі Проекти
                </motion.h2>

                {isLoading && <Loading text="Завантаження проектів..." />}
                {isError && <ErrorMessage title="Помилка" message={(error as any)?.data?.message || "Не вдалося завантажити проекти."} />}

                {data && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {data.projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, amount: 0.5 }}
                            >
                                <ProjectCard project={project} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <Button
                        variant="secondary"
                        className="py-3 px-6 text-lg rounded-full"
                        onClick={() => navigate('/project/explore')}
                    >
                        Переглянути Всі Проекти
                        <ArrowRight className="size-5 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

const TechSection = () => {
    const { data: technologies, isLoading } = useGetTechnologiesQuery();

    const displayedTech = technologies?.slice(0, 16) || [];

    return (
        <section className="py-20 bg-card/30 border-y border-border/50">
            <div className="container mx-auto px-4 text-center">
                <motion.h2
                    className="text-4xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Шукайте за Технологіями
                </motion.h2>
                <motion.p
                    className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Фільтруйте проекти та знаходьте співавторів, які працюють з тими ж інструментами, що і ви.
                </motion.p>

                {isLoading ? (
                    <Loading text="Завантаження технологій..." />
                ) : (
                    <motion.div
                        className="flex flex-wrap gap-3 justify-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.05 }}
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {displayedTech.map((tech, index) => (
                            <TechBadge key={tech.id} name={tech.name} index={index} />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

const TechBadge = ({ name, index }: { name: string, index: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        viewport={{ once: true }}
        className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium"
    >
        {name}
    </motion.div>
);

const HowItWorksSection = () => {
    const steps = [
        { icon: Rocket, title: "Створіть Проект", desc: "Опишіть свою ідею, додайте медіа та технології, якими ви користувалися." },
        { icon: Network, title: "Знайдіть Команду", desc: "Додайте співавторів або знайдіть нових учасників серед користувачів платформи." },
        { icon: CheckCircle, title: "Отримайте Фідбек", desc: "Публікуйте проект, беріть участь у хакатонах та отримуйте оцінки від спільноти." },
    ];

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <motion.h2
                    className="text-4xl font-bold text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Як це працює?
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center text-center p-6 bg-card/50 rounded-2xl border border-border/50"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <step.icon className="size-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeaturedHackathonsSection = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useGetHackathonsQuery({ limit: 3, status: 'OPEN' });

    return (
        <section className="py-20 bg-card/30 border-y border-border/50">
            <div className="container mx-auto px-4">
                <motion.h2
                    className="text-4xl font-bold text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Актуальні Хакатони
                </motion.h2>

                {isLoading && <Loading text="Завантаження хакатонів..." />}
                {isError && <ErrorMessage title="Помилка" message={(error as any)?.data?.message || "Не вдалося завантажити хакатони."} />}

                {data && data.hackathons.length > 0 && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {data.hackathons.map((hackathon, index) => (
                            <motion.div
                                key={hackathon.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, amount: 0.5 }}
                            >
                                <HackathonCard hackathon={hackathon} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {data && data.hackathons.length === 0 && !isLoading && (
                    <p className="text-center text-muted-foreground text-lg">Наразі немає відкритих хакатонів.</p>
                )}

                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <Button
                        variant="secondary"
                        className="py-3 px-6 text-lg rounded-full"
                        onClick={() => navigate('/hackathon/explore')}
                    >
                        Переглянути Всі Хакатони
                        <ArrowRight className="size-5 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-16 sm:py-24 relative overflow-hidden px-4">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-card/30 z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[300px] sm:size-[600px] bg-primary/10 rounded-full blur-3xl" />

            <motion.div
                className="container mx-auto px-4 text-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <Code className="size-10 sm:size-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Готові показати свій код?</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                    Приєднуйтесь до тисяч розробників. Створіть портфоліо, знайдіть команду та вигравайте призи.
                </p>
                <Button
                    variant="primary"
                    className="py-3 px-8 text-lg rounded-full mx-auto inline-flex items-center"
                    onClick={() => navigate('/auth/register')}
                >
                    Зареєструватися
                    <ArrowRight className="size-5 ml-2" />
                </Button>
            </motion.div>
        </section>
    );
};
const Footer = () => {
    return (
        <footer className="py-12 bg-card/30 border-t border-border/50">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
                <div className="flex items-center gap-2">
                    <Layers className="size-6 text-primary" />
                    <span className="text-xl font-bold">ProjeX</span>
                </div>
                <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                    <Link to="/project/explore" className="text-muted-foreground hover:text-foreground transition-colors">Проекти</Link>
                    <Link to="/hackathon/explore" className="text-muted-foreground hover:text-foreground transition-colors">Хакатони</Link>
                    <Link to="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Вхід</Link>
                </nav>
                <p className="text-muted-foreground text-sm">
                    © {new Date().getFullYear()} ProjeX. Всі права захищено.
                </p>
            </div>
        </footer>
    );
};

export default Home;