// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import { Input } from "../../../../components/input.tsx";
import { Label } from "../../../../components/label.tsx";
import { Textarea } from "../../../../components/textarea.tsx";
import { Eye, FileText } from "lucide-react";
import { useCreateHackathon } from "../../hooks/useCreateHackathonContext.tsx";
import {renderMarkdown} from "../../../../shared/utils/utils.ts";
import Button from "../../../../components/Button.tsx"; // Перенеси renderMarkdown у utils!

export function StepBasics() {
    // Беремо з контексту ТІЛЬКИ те, що потрібно цьому кроку
    const {
        title,
        setTitle,
        description,
        setDescription,
        showMarkdownPreview,
        setShowMarkdownPreview
    } = useCreateHackathon();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <FileText className="size-6 text-white" />
                </div>
                <div>
                    <h2>Основна інформація</h2>
                    <p className="text-muted-foreground">Назва та детальний опис хакатону</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="hackathonTitle">Назва хакатону *</Label>
                <Input
                    id="hackathonTitle"
                    type="text"
                    placeholder="Найкращий хакатон у світі..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="description">Опис хакатону *</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                        className="flex gap-8 hover:scale-10"
                    >
                        <Eye className="size-6" />
                        {showMarkdownPreview ? 'Редагувати' : 'Переглянути'}
                    </Button>
                </div>

                {!showMarkdownPreview ? (
                    <Textarea
                        id="description"
                        placeholder="# Про хакатон..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[300px] rounded-2xl bg-secondary/50..."
                    />
                ) : (
                    <div
                        className="min-h-[300px] rounded-2xl bg-secondary/50..."
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
                    />
                )}
            </div>
        </div>
    );
}