// features/hackathon/components/view/tabs/TabOverview.tsx
import React from "react";

import { Badge } from "../../../../components/badge.tsx";
import type {HackathonWithDetails} from "../../api/hackathonApi.ts";

export function TabOverview({ hackathon }: { hackathon: HackathonWithDetails }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ліва колонка - Опис */}
            <div className="md:col-span-2 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold mb-4">Деталі Хакатону</h3>
                {/* Тут можна вставити рендер Markdown, якщо опис це підтримує */}
                <div
                    className="prose prose-invert text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: hackathon.description.replace(/\n/g, '<br />') }} // Простий рендер
                />
            </div>

            {/* Права колонка - Теми та Судді */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold mb-3">Теми</h4>
                    <div className="flex flex-wrap gap-2">
                        {hackathon.themes.map((theme: any) => (
                            <Badge key={theme.id} className="bg-primary/10 text-primary border-primary/30">
                                {theme.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold mb-3">Судді</h4>
                    <div className="space-y-2">
                        {hackathon.judges.map((judge: any) => (
                            <div key={judge.id} className="text-sm text-muted-foreground">{judge.username}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}