
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Loading from '../../../components/Loading.tsx';
import ErrorMessage from '../../../components/ErrorMessage.tsx';
import { Input } from '../../../components/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/Select.tsx';
import {ArrowUp, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useGetHackathonsQuery, type HackathonListParams } from '../api/hackathonApi.ts';
import HackathonCard from "../components/hackathon/HackathonCard.tsx";

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

export function HackathonListPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState<'ALL' | 'OPEN' | 'RATING' | 'CLOSED' | 'ARCHIVED'>('ALL');
    const debouncedSearch = useDebounce(search, 300);

    const [cursor, setCursor] = useState<string | undefined>(undefined);
    useEffect(() => {
        const newSearchParams = new URLSearchParams();
        if (debouncedSearch) {
            newSearchParams.set('search', debouncedSearch);
        }
        if (status !== 'ALL') {
            newSearchParams.set('status', status);
        }
        setSearchParams(newSearchParams, { replace: true });
    }, [debouncedSearch, status, setSearchParams]);
    useEffect(() => {
        setCursor(undefined);
    }, [debouncedSearch, status]);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {

        animate(window.scrollY, 0, {

            duration: 0.7,
            ease: "easeInOut",

            onUpdate: (value) => {

                window.scrollTo(0, value);
            }
        });
    };
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const queryParams: HackathonListParams = useMemo(() => ({
        search: debouncedSearch,
        status: status,
        limit: 9,
        cursor: cursor,
    }), [debouncedSearch, status, cursor]);

    const { data, error, isError, isLoading, isFetching } =
        useGetHackathonsQuery(queryParams);

    const hackathons = data?.hackathons || [];
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
            return <Loading fullScreen text="Завантаження хакатонів..." />;
        }
        if (isError) {
            return <ErrorMessage fullScreen title="Помилка" message={(error as any)?.data?.message || "Не вдалося завантажити хакатони."} />;
        }
        if (hackathons.length === 0) {
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

                {hackathons.map(hackathon => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
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
                    Знайти Хакатон
                </motion.h1>

                <motion.div
                    className="flex flex-col md:flex-row gap-4 mb-10 p-4 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-xl
                               sticky top-22 z-20 drop-shadow-[0_0_50px_#411578FF]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                        <Input
                            placeholder="Пошук за назвою..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 bg-secondary/50 rounded-lg"
                        />
                    </div>
                    <Select
                        value={status}
                        onValueChange={(val) => {setStatus(val as 'ALL' | 'OPEN' | 'RATING' | 'CLOSED' | 'ARCHIVED');setCursor(undefined)} }
                    >
                        <SelectTrigger className="md:w-[200px] h-12 bg-secondary/50 rounded-lg">
                            <SelectValue placeholder="Фільтр за статусом" />
                        </SelectTrigger>
                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border/50">
                            <SelectItem value="ALL">Всі статуси</SelectItem>
                            <SelectItem value="OPEN">Відкриті</SelectItem>
                            <SelectItem value="RATING">Йде оцінювання</SelectItem>
                            <SelectItem value="CLOSED">Завершені</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {renderContent()}

                <div className="h-20 mt-10 flex items-center justify-center">
                    {isFetching && !isLoading && (
                        <Loading text="Завантаження..." />
                    )}
                    {!isFetching && nextCursor && (
                        <div ref={ref} className="w-full h-1" />
                    )}
                    {!nextCursor && !isLoading && !isError && hackathons.length > 0 && (
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

export default HackathonListPage;