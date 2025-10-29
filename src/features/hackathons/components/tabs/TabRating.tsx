import { useState } from "react";
import { useRateProjectMutation, type HackathonProject, type HackathonRatingCategory } from "../../api/hackathonApi.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/Select.tsx";
import Button from "../../../../components/Button.tsx";
import Loading from "../../../../components/Loading.tsx";
import { Star, Info } from "lucide-react";

interface TabRatingProps {
    hackathonId: string;
    projects: HackathonProject[];
    categories: HackathonRatingCategory[];
    canRate: boolean;
}

const RatingStar = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
    <Star
        className={`size-6 cursor-pointer transition-all ${
            filled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50 hover:text-yellow-400"
        }`}
        onClick={onClick}
    />
);

const RatingInput = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
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


export function TabRating({ hackathonId, projects, categories, canRate }: TabRatingProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [ratings, setRatings] = useState<{ [key: string]: number }>({});

    const [rateProject, { isLoading }] = useRateProjectMutation();

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

    const handleRatingChange = (categoryId: string, value: number) => {
        setRatings(prev => ({ ...prev, [categoryId]: value }));
    };

    const handleSubmitRatings = async () => {
        if (!selectedProjectId || isLoading) return;

        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (!selectedProject) return;

        const { hpId } = selectedProject;

        try {

            const ratingPromises = Object.entries(ratings).map(([categoryId, rating]) => {
                return rateProject({
                    hpId: hpId,
                    body: { categoryId, rating }
                }).unwrap();
            });

            await Promise.all(ratingPromises);

            alert("Оцінки успішно відправлено!");
            setSelectedProjectId(null);
            setRatings({});

        } catch (err) {
            console.error("Помилка при відправці оцінок:", err);
            alert("Помилка: " + (err as any).data?.message || "Не вдалося відправити оцінки.");
        }
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const allCategoriesRated = categories.every(cat => ratings[cat.id] > 0);

    return (
        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Оцінювання проектів</h3>

            <Select
                onValueChange={(value) => {
                    setSelectedProjectId(value);
                    setRatings({});
                }}
                value={selectedProjectId || ""}
            >
                <SelectTrigger className="w-full bg-secondary/50 rounded-lg">
                    <SelectValue placeholder="Оберіть проект для оцінювання..." />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-xl border-border/50">
                    {projects.map(project => (
                        <SelectItem key={project.id} value={project.id} className="cursor-pointer">
                            {project.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isLoading && <Loading text="Відправка оцінок..." />}

            {selectedProject && !isLoading && (
                <div className="mt-8 space-y-6">
                    <h4 className="text-xl font-semibold">Критерії оцінювання для "{selectedProject.title}"</h4>
                    {categories.sort((a, b) => a.order - b.order).map(category => (
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
                        onClick={handleSubmitRatings}
                        disabled={!allCategoriesRated || isLoading}
                    >
                        {isLoading ? "Відправка..." : "Відправити оцінки"}
                    </Button>
                </div>
            )}
        </div>
    );
}