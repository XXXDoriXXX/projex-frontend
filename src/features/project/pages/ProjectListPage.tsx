import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Loading from '../../../components/Loading.tsx';
import ErrorMessage from '../../../components/ErrorMessage.tsx';
import { Input } from '../../../components/input.tsx';
import {ArrowUp, Search, User, X} from 'lucide-react';
import {
    useGetProjectsQuery,
    useGetTechnologiesQuery,
    type ProjectListParams,
    type Technology
} from '../api/projectApi.ts';
import ProjectCard from "../../../components/ProjectCard.tsx";
import {useLazyLookupUserByEmailQuery} from "../../profile/api/userApi.ts";
import {Label} from "../../../components/label.tsx";
import {Badge} from "../../../components/badge.tsx";

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function ProjectListPage() {
    const [search, setSearch] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    const [techInput, setTechInput] = useState('');
    const [selectedTechnologies, setSelectedTechnologies] = useState<Technology[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [authorId, setAuthorId] = useState<string | undefined>(undefined);

    const debouncedSearch = useDebounce(search, 300);
    const debouncedAuthorEmail = useDebounce(authorEmail, 500);

    const [triggerLookup, { data: authorData, isFetching: isLookingUpUser }] = useLazyLookupUserByEmailQuery();
    const { data: allTechnologies, isLoading: isTechLoading } = useGetTechnologiesQuery();
    const technologyIds = useMemo(() => selectedTechnologies.map(t => t.id), [selectedTechnologies]);
    useEffect(() => {
        setCursor(undefined);
    }, [debouncedSearch, authorId, technologyIds]);

    useEffect(() => {
        if (debouncedAuthorEmail && debouncedAuthorEmail.includes('@')) {
            triggerLookup(debouncedAuthorEmail);
        } else {
            setAuthorId(undefined);
        }
    }, [debouncedAuthorEmail, triggerLookup]);

    useEffect(() => {
        if (authorData) {
            setAuthorId(authorData.id);
        }
    }, [authorData]);

    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        animate(window.scrollY, 0, {
            duration: 0.7,
            ease: "easeInOut",
            onUpdate: (value) => window.scrollTo(0, value),
        });
    };
    const handleTechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTechInput(e.target.value);
        setShowSuggestions(true);
    };

    const handleAddTechnology = (tech: Technology) => {
        if (!selectedTechnologies.find(t => t.id === tech.id)) {
            setSelectedTechnologies([...selectedTechnologies, tech]);
        }
        setTechInput('');
        setShowSuggestions(false);
    };

    const handleRemoveTechnology = (techId: string) => {
        setSelectedTechnologies(selectedTechnologies.filter(t => t.id !== techId));
    };
    const filteredSuggestions = useMemo(() => {
        if (!techInput.trim()) return [];
        const lowerCaseInput = techInput.toLowerCase();
        return (allTechnologies || []).filter(tech =>
            tech.name.toLowerCase().includes(lowerCaseInput) &&
            !selectedTechnologies.find(t => t.id === tech.id)
        );
    }, [techInput, allTechnologies, selectedTechnologies]);
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const queryParams: ProjectListParams = useMemo(() => ({
        search: debouncedSearch,
        authorId: authorId,
        technologies: technologyIds,
        limit: 9,
        cursor: cursor,
    }), [debouncedSearch, authorId, technologyIds, cursor]);

    const { data, error, isError, isLoading, isFetching } =
        useGetProjectsQuery(queryParams);

    const projects = data?.projects || [];
    const nextCursor = data?.nextCursor;

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '400px 0px',
    });

    useEffect(() => {
        if (inView && nextCursor && !isFetching && cursor !== nextCursor) {
            setCursor(nextCursor);
        }
    }, [inView, nextCursor, isFetching, cursor]);

    const renderContent = () => {
        if (isLoading) {
            return <Loading fullScreen text="Завантаження проектів..." />;
        }
        if (isError) {
            return <ErrorMessage fullScreen title="Помилка" message={(error as any)?.data?.message || "Не вдалося завантажити проекти."} />;
        }
        if (projects.length === 0) {
            return (
                <div className="text-center text-muted-foreground mt-20">
                    <h3 className="text-xl font-semibold">Нічого не знайдено</h3>
                    <p>Спробуйте змінити параметри пошуку або фільтри.</p>
                </div>
            );
        }

        return (
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 z-0" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-4 pt-32 pb-24">
                <motion.h1
                    className="text-4xl md:text-6xl font-bold text-foreground mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Знайти Проект
                </motion.h1>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 p-4 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-xl
                               sticky top-4 z-20 drop-shadow-[0_0_50px_#411578FF]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Пошук за назвою */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                        <Input
                            placeholder="Пошук за назвою..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 bg-secondary/50 rounded-lg"
                        />
                    </div>

                    {/* Пошук за автором (email) */}
                    <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                        <Input
                            placeholder="Email автора..."
                            value={authorEmail}
                            onChange={(e) => setAuthorEmail(e.target.value)}
                            className="pl-10 h-12 bg-secondary/50 rounded-lg"
                            disabled={isLookingUpUser}
                        />
                        {isLookingUpUser && <Loading className="absolute right-3 top-1/2 -translate-y-1/2" />}
                    </div>

                    {/* --- Новий фільтр технологій --- */}
                    <div className="space-y-3 md:col-span-2 relative">
                        <Label htmlFor="techInput">Технології</Label>
                        <div className="flex gap-2">
                            <Input
                                id="techInput"
                                type="text"
                                placeholder="React, TypeScript, Node.js..."
                                value={techInput}
                                onChange={handleTechInputChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Затримка, щоб дозволити клік
                                className="rounded-lg bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12"
                                disabled={isTechLoading}
                            />
                        </div>
                        {/* Випадаючий список пропозицій */}
                        {showSuggestions && techInput.trim() && filteredSuggestions.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filteredSuggestions.map((tech) => (
                                    <button
                                        key={tech.id}
                                        type="button"
                                        onClick={() => handleAddTechnology(tech)}
                                        className="w-full text-left p-3 hover:bg-secondary/50 transition-colors"
                                    >
                                        {tech.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Обрані технології у вигляді Badge */}
                        {selectedTechnologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedTechnologies.map((tech) => (
                                    <Badge
                                        key={tech.id}
                                        className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 backdrop-blur-sm pl-3 pr-2 py-1.5 gap-2"
                                    >
                                        {tech.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTechnology(tech.id)}
                                            className="hover:text-destructive transition-colors"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>


                </motion.div>

                {renderContent()}

                <div className="h-20 mt-10 flex items-center justify-center">
                    {isFetching && !isLoading && (
                        <Loading text="Завантаження..." />
                    )}
                    {!isFetching && nextCursor && (
                        <div ref={ref} className="w-full h-1" />
                    )}
                    {!nextCursor && !isLoading && !isError && projects.length > 0 && (
                        <p className="text-muted-foreground">Ви досягли кінця списку.</p>
                    )}
                </div>

                <AnimatePresence>
                    {showScrollTop && (
                        <motion.button
                            className="fixed bottom-10 right-10 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                            onClick={scrollToTop}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            aria-label="Повернутись нагору"
                        >
                            <ArrowUp className="size-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ProjectListPage;