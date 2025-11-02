import { useState } from "react";
import { useRateProjectMutation, type HackathonProject, type HackathonRatingCategory } from "../../api/hackathonApi.ts";
import Button from "../../../../components/Button.tsx";
import { toast } from "sonner";
import { Star, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Для анімації
import ProjectCard from "../../../../components/ProjectCard.tsx"; // Наш ProjectCard

// --- Компоненти RatingStar та RatingInput залишаються без змін ---
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
const RatingInput = ({ value, onChange }: RatingInputProps) => {
    return (
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
};
// --- Кінець незмінних компонентів ---


interface TabRatingProps {
    hackathonId: string;
    projects: HackathonProject[];
    categories: HackathonRatingCategory[];
    canRate: boolean;
}

export function TabRating({ hackathonId, projects, categories, canRate }: TabRatingProps) {
    // Змінюємо назву стану для ясності
    const [openProjectId, setOpenProjectId] = useState<string | null>(null);
    const [ratings, setRatings] = useState<{ [key: string]: number }>({});

    const [rateProject, { isLoading }] = useRateProjectMutation();

    // ... (Блоки 'canRate', 'projects.length', 'categories.length' залишаються без змін) ...
    if (!canRate) {
        return (
            <div className="text-center text-muted-foreground p-12 bg-card/50 rounded-2xl">
                <Info className="size-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">У вас немає прав для оцінювання</h3>
                <p>Оцінювати проекти можуть лише судді, або учасники/глядачі, якщо це дозволено налаштуваннями хакатону.</p>
            </div>
        );
    }
    if (projects.length === 0) {
        return <div className="text-center text-muted-foreground">Немає проектів для оцінювання.</div>;
    }
    if (categories.length === 0) {
        return <div className="text-center text-muted-foreground">Категорії оцінювання не налаштовані для цього хакатону.</div>;
    }
    // --- Кінець незмінних блоків ---


    const handleRatingChange = (categoryId: string, value: number) => {
        setRatings(prev => ({ ...prev, [categoryId]: value }));
    };

    // Новий хендлер для відкриття/закриття акордеону
    const handleProjectSelect = (projectId: string) => {
        // Якщо клікнули по вже відкритому - закриваємо. Інакше - відкриваємо новий.
        setOpenProjectId(prevId => (prevId === projectId ? null : projectId));
        setRatings({}); // Скидаємо оцінки при зміні проекту
    };

    // Оновлений хендлер. Тепер він приймає hpId та title
    const handleSubmitRatings = async (hpId: string, projectTitle: string) => {
        if (isLoading) return;

        const ratingPromise = Promise.all(
            Object.entries(ratings).map(([categoryId, rating]) => {
                return rateProject({
                    hpId: hpId,
                    body: { categoryId, rating }
                }).unwrap();
            })
        );

        toast.promise(ratingPromise, {
            loading: `Відправка оцінок для "${projectTitle}"...`,
            success: () => {
                setOpenProjectId(null); // Закриваємо акордеон
                setRatings({});
                return "Оцінки успішно відправлено!";
            },
            error: (err) => {
                console.error("Помилка при відправці оцінок:", err);
                return "Помилка: " + (err as any).data?.message || "Не вдалося відправити оцінки.";
            }
        });
    };

    return (
        // Збільшуємо ширину контейнера
        <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-2xl font-semibold mb-6">Оцінювання проектів</h3>

            {/* Повністю видаляємо старий <Select> та {isLoading} */}

            {projects.map(project => {
                // Ця логіка тепер всередині циклу
                const allCategoriesRated = categories.every(cat => ratings[cat.id] > 0);
                const isOpen = openProjectId === project.id;

                return (
                    // Кожен проект - це окремий блок "акордеону"
                    <div
                        key={project.hpId} // Використовуємо hpId, він унікальний для хакатону
                        className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                        {/* 1. Картка слугує шапкою */}
                        <ProjectCard
                            project={project}
                            // Передаємо наш кастомний onClick
                            onClick={() => handleProjectSelect(project.id)}
                            // Прибираємо зайві ефекти, щоб виглядало як частина UI
                            className={`
                                border-none shadow-none hover:scale-100 
                                ${isOpen ? "rounded-b-none" : ""}
                            `}
                        />

                        {/* 2. Анімований контент, що згортається */}
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
                                    {/* 3. Форма оцінювання */}
                                    <div className="p-6 border-t border-border/50 space-y-6">
                                        <h4 className="text-xl font-semibold">Критерії оцінювання для "{project.title}"</h4>

                                        {[...categories].sort((a, b) => a.order - b.order).map(category => (
                                            <div key={category.id}>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    {category.name} (від 1 до 10)
                                                </label>
                                                <RatingInput
                                                    value={ratings[category.id] || 0}
                                                    onChange={(value) => handleRatingChange(category.id, value)}
                                                />
                                            </div>
                                        ))}

                                        <Button
                                            variant="primary"
                                            className="w-full justify-center mt-6"
                                            onClick={() => handleSubmitRatings(project.hpId, project.title)}
                                            disabled={!allCategoriesRated || isLoading}
                                        >
                                            {isLoading ? "Відправка..." : "Відправити оцінки"}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}