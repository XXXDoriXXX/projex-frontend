import React, { useState, useMemo, memo } from "react";
import {
    useRateProjectMutation,
    type HackathonProject,
    type HackathonRatingCategory,
    useGetMyRatedProjectsQuery,
    useGetMyHackathonProjectsQuery,
    // 1. Імпортуємо тип MyRating
    type MyRating
} from "../../api/hackathonApi.ts";
import Button from "../../../../components/Button.tsx";

import { toast } from "sonner";
import { Star, Info, Search, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "../../../../components/ProjectCard.tsx";
import { cn } from "../../../../shared/utils/utils.ts";
import Loading from "../../../../components/Loading.tsx";
import ErrorMessage from "../../../../components/ErrorMessage.tsx";
import {Textarea} from "../../../../components/textarea.tsx";
import {Input} from "../../../../components/input.tsx";

// ... (RatingStar та RatingInput без змін) ...
interface RatingStarProps {
    filled: boolean;
    onClick: () => void;
}
const RatingStar = ({ filled, onClick }: RatingStarProps) => (
    <Star
        className={`size-6 cursor-pointer transition-all ${
            filled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50 hover:text-yellow-400"
        }`}
        onClick={onClick}
    />
);

interface RatingInputProps {
    value: number;
    onChange: (value: number) => void;
}
const RatingInput = ({ value, onChange }: RatingInputProps) => (
    <div className="flex gap-1">
        {[...Array(10)].map((_, i) => (
            <RatingStar
                key={i}
                filled={i < value}
                onClick={() => onChange(i + 1)}
            />
        ))}
    </div>
);


interface RatingState {
    rating: number;
    comment: string;
}

interface TabRatingProps {
    hackathonId: string;
    projects: HackathonProject[];
    categories: HackathonRatingCategory[];
    canRate: boolean;
}

interface RatingProjectItemProps {
    project: HackathonProject;
    categories: HackathonRatingCategory[];
    isRated: boolean;
    isOpen: boolean;
    onToggle: () => void;
    // 2. Додаємо проп для передачі наявних оцінок
    existingRatings: MyRating[];
}

const RatingProjectItem = memo(({ project, categories, isRated, isOpen, onToggle, existingRatings }: RatingProjectItemProps) => {

    // 3. Створюємо функцію ініціалізації стану
    // Вона заповнить стан наявними оцінками, якщо вони є
    const initializeRatings = (): { [key: string]: RatingState } => {
        if (!existingRatings || existingRatings.length === 0) {
            return {};
        }

        const initialState: { [key: string]: RatingState } = {};
        for (const rating of existingRatings) {
            initialState[rating.categoryId] = {
                rating: rating.rating,
                comment: rating.comment || ""
            };
        }
        return initialState;
    };

    // 4. Ініціалізуємо стан за допомогою цієї функції
    const [ratings, setRatings] = useState(initializeRatings);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [rateProject, { isLoading: isRating }] = useRateProjectMutation();

    const handleRatingValueChange = (categoryId: string, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                rating: rating,
                comment: prev[categoryId]?.comment || ""
            }
        }));
    };

    const handleCommentChange = (categoryId: string, comment: string) => {
        setRatings(prev => ({
            ...prev,
            [categoryId]: {
                ...prev[categoryId],
                rating: prev[categoryId]?.rating || 0,
                comment: comment
            }
        }));
    };

    const handleSubmitRatings = async (hpId: string, projectTitle: string) => {
        if (isRating) return;
        setSubmissionError(null);

        const ratingActions = Object.entries(ratings)
            .filter(([, { rating }]) => rating > 0)
            .map(([categoryId, { rating, comment }]) => {
                return rateProject({
                    hpId: hpId,
                    body: {
                        categoryId,
                        rating,
                        comment: comment || undefined
                    }
                }).unwrap();
            });

        // 5. Оновлюємо текст тосту залежно від isRated
        const loadingToastId = toast.loading(
            isRated
                ? `Оновлення оцінок для "${projectTitle}"...`
                : `Відправка оцінок для "${projectTitle}"...`
        );

        try {
            await Promise.all(ratingActions);
            // 6. Оновлюємо текст тосту успіху
            toast.success(
                isRated ? "Оцінки успішно оновлено!" : "Оцінки успішно відправлено!",
                { id: loadingToastId }
            );
            // setRatings({}); // Не скидаємо стан, щоб користувач бачив оновлені дані
            onToggle(); // Закриваємо акордеон після успіху

        } catch (err) {
            toast.dismiss(loadingToastId);
            let errorMessage = "Не вдалося відправити оцінки.";
            if (err && typeof err === 'object' && 'data' in err &&
                err.data && typeof err.data === 'object' && 'message' in err.data) {
                errorMessage = (err.data as any).message;
            }
            console.error("Помилка при відправці оцінок:", err);
            setSubmissionError(errorMessage);
        }
    };

    const allCategoriesRated = categories.every(cat => (ratings[cat.id]?.rating || 0) > 0);

    return (
        <div
            className={cn(
                "relative bg-card/50 backdrop-blur-2xl border rounded-2xl overflow-hidden transition-all duration-300",
                isOpen ? "border-primary/80" :
                    isRated ? "border-green-500/30 opacity-70 grayscale-[30%] hover:opacity-100 hover:grayscale-0" :
                        "border-border/50"
            )}
        >
            {isRated && !isOpen && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/50">
                    <CheckCircle className="size-3.5" />
                    Оцінено
                </div>
            )}
            <ProjectCard
                project={project}
                onClick={onToggle}
                className={`
                    border-none shadow-none hover:scale-100 
                    ${isOpen ? "rounded-b-none" : ""}
                `}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        {/* 7. Прибираємо умовний рендеринг !isRated / isRated.
                               Тепер форма показується ЗАВЖДИ, коли isOpen. */}
                        <div className="p-6 border-t border-border/50 space-y-6">
                            <h4 className="text-xl font-semibold">Критерії оцінювання для "{project.title}"</h4>

                            {[...categories].sort((a, b) => a.order - b.order).map(category => (
                                <div key={category.id}>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        {category.name} (від 1 до 10)
                                    </label>
                                    <RatingInput
                                        // Стан `ratings` вже ініціалізований з наявними даними
                                        value={ratings[category.id]?.rating || 0}
                                        onChange={(value) => handleRatingValueChange(category.id, value)}
                                    />
                                    <Textarea
                                        placeholder="Додайте коментар (необов'язково)..."
                                        className="mt-3 text-sm"
                                        rows={2}
                                        value={ratings[category.id]?.comment || ""}
                                        onChange={(e) => handleCommentChange(category.id, e.target.value)}
                                    />
                                </div>
                            ))}
                            {submissionError && (
                                <div className="flex justify-center">
                                    <ErrorMessage
                                        message={submissionError}
                                        type="error"
                                        onRetry={() => handleSubmitRatings(project.hpId, project.title)}
                                        onDismiss={() => setSubmissionError(null)}
                                    />
                                </div>
                            )}
                            <Button
                                variant="primary"
                                className="w-full justify-center mt-6"
                                onClick={() => handleSubmitRatings(project.hpId, project.title)}
                                disabled={!allCategoriesRated || isRating}
                            >
                                {/* 8. Оновлюємо текст кнопки */}
                                {isRating
                                    ? (isRated ? "Оновлення..." : "Відправка...")
                                    : (isRated ? "Оновити оцінки" : "Відправити оцінки")
                                }
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});



export function TabRating({ hackathonId, projects, categories, canRate }: TabRatingProps) {
    const [openProjectId, setOpenProjectId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: myRatedProjectsData, isLoading: isLoadingRatings } =
        useGetMyRatedProjectsQuery(hackathonId, { skip: !canRate });

    const { data: mySubmissionsData, isLoading: isLoadingMySubmissions } =
        useGetMyHackathonProjectsQuery(hackathonId, { skip: !canRate });


    if (!canRate) { /* ... */ }
    if (projects.length === 0) { /* ... */ }
    if (categories.length === 0) { /* ... */ }

    const ratedHpIdSet = useMemo(() =>
            new Set(myRatedProjectsData?.map(r => r.hackathonProjectId) || [])
        , [myRatedProjectsData]);

    const mySubmissionHpIdSet = useMemo(() =>
            new Set(mySubmissionsData?.map(p => p.hpId) || [])
        , [mySubmissionsData]);


    const { unratedProjects, ratedProjects } = useMemo(() => {
        const filtered = projects.filter(project =>
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !mySubmissionHpIdSet.has(project.hpId)
        );

        const unrated: HackathonProject[] = [];
        const rated: HackathonProject[] = [];

        for (const project of filtered) {
            if (ratedHpIdSet.has(project.hpId)) {
                rated.push(project);
            } else {
                unrated.push(project);
            }
        }

        unrated.sort((a, b) => a.title.localeCompare(b.title));
        rated.sort((a, b) => a.title.localeCompare(b.title));
        return { unratedProjects: unrated, ratedProjects: rated };
    }, [projects, searchTerm, ratedHpIdSet, mySubmissionHpIdSet]);

    if (isLoadingRatings || isLoadingMySubmissions) {
        return <Loading text="Завантаження даних для оцінювання..." />
    }

    const handleToggleProject = (projectId: string) => {
        setOpenProjectId(prevId => (prevId === projectId ? null : projectId));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4">

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h3 className="text-2xl font-semibold">Оцінювання проектів</h3>
                <div className="relative w-full md:max-w-xs">
                    <Input
                        type="text"
                        placeholder="Пошук за назвою..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {unratedProjects.length > 0 && (
                    <h4 className="text-lg font-medium text-muted-foreground pt-4 md:col-span-2">
                        До оцінювання ({unratedProjects.length})
                    </h4>
                )}
                {unratedProjects.map(project => (
                    <RatingProjectItem
                        key={project.hpId}
                        project={project}
                        categories={categories}
                        isRated={false}
                        isOpen={openProjectId === project.id}
                        onToggle={() => handleToggleProject(project.id)}
                        // 9. Передаємо порожній масив для неоцінених
                        existingRatings={[]}
                    />
                ))}

                {ratedProjects.length > 0 && (
                    <h4 className="text-lg font-medium text-muted-foreground pt-8 md:col-span-2">
                        Оцінені ({ratedProjects.length})
                    </h4>
                )}
                {ratedProjects.map(project => {
                    // 10. Фільтруємо та передаємо наявні оцінки для оцінених проектів
                    const existingRatings = myRatedProjectsData?.filter(
                        r => r.hackathonProjectId === project.hpId
                    ) || [];

                    return (
                        <RatingProjectItem
                            key={project.hpId}
                            project={project}
                            categories={categories}
                            isRated={true}
                            isOpen={openProjectId === project.id}
                            onToggle={() => handleToggleProject(project.id)}
                            existingRatings={existingRatings}
                        />
                    );
                })}

                {unratedProjects.length === 0 && ratedProjects.length === 0 && searchTerm && (
                    <div className="text-center text-muted-foreground p-12 bg-card/50 rounded-2xl md:col-span-2">
                        <p>Проектів за запитом "{searchTerm}" не знайдено.</p>
                    </div>
                )}
                {unratedProjects.length === 0 && ratedProjects.length > 0 && !searchTerm && (
                    <div className="text-center text-green-500 p-12 bg-card/50 rounded-2xl flex items-center justify-center gap-2 md:col-span-2">
                        <CheckCircle className="size-5" />
                        <p>Чудова робота! Ви оцінили всі проекти.</p>
                    </div>
                )}
            </div>
        </div>
    );
}