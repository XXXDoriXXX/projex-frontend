import {Hash, X} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import {Input} from "../../../../components/input.tsx";
import Button from "../../../../components/Button.tsx";
import {Badge} from "../../../../components/badge.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";
import type {MockTheme} from "../../types/hackathonTypes.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const allThemes: MockTheme[] = [
    { id: 'theme-1', name: 'AI & Machine Learning' },
    { id: 'theme-2', name: 'FinTech' },
    { id: 'theme-3', name: 'GreenTech' },
    { id: 'theme-4', name: 'Education' },
    { id: 'theme-5', name: 'Web 3.0 & Blockchain' },
];
export function StepThemes(){


    const {
        themeIds,
        newThemes,
        newThemeInput,
        setNewThemeInput,
        handleToggleTheme,
        handleAddNewTheme,
        handleRemoveNewTheme

    } = useCreateHackathon();
    return( <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Hash className="size-6 text-white" />
            </div>
            <div>
                <h2>Тематика</h2>
                <p className="text-muted-foreground">Оберіть існуючі теми або додайте нові</p>
            </div>
        </div>

        {/* Існуючі теми */}
        <div className="space-y-3">
            <Label>Оберіть існуючі теми</Label>
            <div className="flex flex-wrap gap-2">
                {allThemes.map(theme => (
                    <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleToggleTheme(theme.id)}
                        className={`py-2 px-4 rounded-full border-2 transition-all ${
                            themeIds.includes(theme.id)
                                ? 'bg-primary/20 border-primary shadow-md'
                                : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                        }`}
                    >
                        {theme.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Нові теми */}
        <div className="space-y-3">
            <Label htmlFor="newTheme">Додати нову тему</Label>
            <div className="flex gap-2">
                <Input
                    id="newTheme"
                    type="text"
                    placeholder="Наприклад: GameDev"
                    value={newThemeInput}
                    onChange={(e) => setNewThemeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTheme())}
                    className="rounded-2xl bg-secondary/50"
                />
                <Button type="button" onClick={handleAddNewTheme} className="rounded-xl bg-primary/90 hover:bg-primary">
                    Додати
                </Button>
            </div>
            {newThemes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {newThemes.map((theme) => (
                        <Badge
                            key={theme}
                            className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 pl-3 pr-2 py-1.5 gap-2"
                        >
                            {theme}
                            <button
                                type="button"
                                onClick={() => handleRemoveNewTheme(theme)}
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