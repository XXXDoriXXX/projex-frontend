import {Rocket} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import Button from "../../../../components/Button.tsx";
import {format} from "date-fns";
import {Badge} from "../../../../components/badge.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "../../../../components/avatar.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";

export function StepReview(){
    const {

        title,
        startDate,
        endDate,
        themeIds,
        newThemes,
        ratingCategoryIds,
        newRatingCategories,
        judgeIds,
        allowParticipantRating,
        allowPublicRating,
        setCurrentStep,
        allThemes,
        allRatingCategories
    } = useCreateHackathon();

    return(<div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Rocket className="size-6 text-white" />
            </div>
            <div>
                <h2>Перевірте інформацію</h2>
                <p className="text-muted-foreground">Переконайтеся, що все вірно перед публікацією</p>
            </div>
        </div>

        <div className="space-y-4">
            {/* Title & Dates */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-muted-foreground">Назва та дати</Label>
                    <Button type="button" variant="ghost" onClick={() => setCurrentStep('basics')} className="text-primary">
                        Редагувати
                    </Button>
                </div>
                <p className="mb-2 text-lg font-semibold">{title || 'Не вказано'}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Початок: {startDate ? format(startDate, "PPP") : 'Не вказано'}</span>
                    <span>Кінець: {endDate ? format(endDate, "PPP") : 'Не вказано'}</span>
                </div>
            </div>

            {/* Themes */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-muted-foreground">Теми</Label>
                    <Button type="button" variant="ghost" onClick={() => setCurrentStep('themes')} className="text-primary">
                        Редагувати
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {themeIds.map(id => allThemes.find(t => t.id === id)?.name).map(name => (
                        <Badge key={name} className="bg-primary/10 text-primary border-primary/30">{name}</Badge>
                    ))}
                    {newThemes.map(name => (
                        <Badge key={name} className="bg-primary/10 text-primary border-primary/30">{name} (Нова)</Badge>
                    ))}
                </div>
            </div>

            {/* Criteria */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-muted-foreground">Критерії оцінювання</Label>
                    <Button type="button" variant="ghost" onClick={() => setCurrentStep('criteria')} className="text-primary">
                        Редагувати
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {ratingCategoryIds.map(id => allRatingCategories.find(c => c.id === id)?.name).map(name => (
                        <Badge key={name} className="bg-primary/10 text-primary border-primary/30">{name}</Badge>
                    ))}
                    {newRatingCategories.map(cat => (
                        <Badge key={cat.name} className="bg-primary/10 text-primary border-primary/30">{cat.name} (Новий)</Badge>
                    ))}
                </div>
            </div>

            {/* Judges */}
            {judgeIds.length > 0 && (
                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                        <Label className="text-muted-foreground">Судді ({judgeIds.length})</Label>
                        <Button type="button" variant="ghost" onClick={() => setCurrentStep('judges')} className="text-primary">
                            Редагувати
                        </Button>
                    </div>
                    <div className="flex -space-x-2">
                        {judgeIds.map((judge) => (
                            <Avatar key={judge.id} className="size-8 border-2 border-background">
                                <AvatarImage src={judge.avatar} alt={judge.name} />
                                <AvatarFallback>{judge.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            )}

            {/* Settings */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-muted-foreground">Налаштування</Label>
                    <Button type="button" variant="ghost" onClick={() => setCurrentStep('settings')} className="text-primary">
                        Редагувати
                    </Button>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Оцінювання учасниками: {allowParticipantRating ? 'Дозволено' : 'Заборонено'}</p>
                    <p>Публічне оцінювання: {allowPublicRating ? 'Дозволено' : 'Заборонено'}</p>
                </div>
            </div>
        </div>
    </div>)
}