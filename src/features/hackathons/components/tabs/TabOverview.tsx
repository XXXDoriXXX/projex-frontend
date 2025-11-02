
import { Badge } from "../../../../components/badge.tsx";
import type {HackathonWithDetails} from "../../api/hackathonApi.ts";
import {MarkdownDisplay} from "../../../../components/MarkdownDisplay.tsx";
import * as React from "react";

export function TabOverview({ hackathon }: { hackathon: HackathonWithDetails }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ліва колонка - Опис */}
            <div className="md:col-span-2 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold mb-4">Деталі Хакатону</h3>
                <MarkdownDisplay
                    text={hackathon.description}
                    truncate={0}
                    className="text-gray-300 max-w-none"
                />
            </div>

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