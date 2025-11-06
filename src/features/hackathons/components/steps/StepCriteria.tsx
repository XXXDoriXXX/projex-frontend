import {ClipboardCheck, X} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import {Input} from "../../../../components/input.tsx";
import Button from "../../../../components/Button.tsx";
import {Badge} from "../../../../components/badge.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";
import type {MockRatingCategory} from "../../types/hackathonTypes.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const allRatingCategories: MockRatingCategory[] = [
    { id: 'cat-1', name: 'Інноваційність', order: 1 },
    { id: 'cat-2', name: 'Технічна реалізація', order: 2 },
    { id: 'cat-3', name: 'Дизайн (UX/UI)', order: 3 },
    { id: 'cat-4', name: 'Презентація', order: 4 },
];
export function StepCriteria() {

    const {
        ratingCategoryIds,
        newRatingCategories,
        newCategoryInput,
        setNewCategoryInput,
        handleToggleCategory,
        handleAddNewCategory,
        handleRemoveNewCategory,
        allRatingCategories,
        isCriteriaLoading
    } = useCreateHackathon();
    if (isCriteriaLoading) {
        return <div>Завантаження критеріїв...</div>;
    }
    return(<div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <ClipboardCheck className="size-6 text-white" />
            </div>
            <div>
                <h2>Критерії оцінювання</h2>
                <p className="text-muted-foreground">За що будуть нараховуватись бали</p>
            </div>
        </div>

        <div className="space-y-3">
            <Label>Оберіть існуючі критерії</Label>
            <div className="flex flex-wrap gap-2">
                {allRatingCategories.map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`py-2 px-4 rounded-full border-2 transition-all ${
                            ratingCategoryIds.includes(cat.id)
                                ? 'bg-primary/20 border-primary shadow-md'
                                : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="newCategory">Додати новий критерій</Label>
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    id="newCategory"
                    type="text"
                    placeholder="Наприклад: Комерційний потенціал"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                    className="rounded-2xl bg-secondary/50 h-12"
                />
                <Button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="rounded-xl bg-primary/90 hover:bg-primary w-full sm:w-auto h-12"
                >
                    Додати
                </Button>
            </div>
            {newRatingCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {newRatingCategories.map((cat) => (
                        <Badge
                            key={cat.name}
                            className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 pl-3 pr-2 py-1.5 gap-2"
                        >
                            {cat.name} (Порядок: {cat.order})
                            <button
                                type="button"
                                onClick={() => handleRemoveNewCategory(cat.name)}
                                className="hover:text-destructive transition-colors"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    </div>)
}