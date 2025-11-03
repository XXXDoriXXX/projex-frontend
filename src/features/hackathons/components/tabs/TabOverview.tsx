
import { Badge } from "../../../../components/badge.tsx";
import type {HackathonWithDetails} from "../../api/hackathonApi.ts";
import {MarkdownDisplay} from "../../../../components/MarkdownDisplay.tsx";
import * as React from "react";
import {Link} from "react-router-dom";
import {Avatar, AvatarFallback, AvatarImage} from "../../../../components/avatar.tsx";

export function TabOverview({ hackathon }: { hackathon: HackathonWithDetails }) {
    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.split(' ').filter(Boolean);
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <h4 className="text-lg font-semibold mb-4">Судді</h4>
                    <div className="space-y-3">
                        {hackathon.judges.map((judge: any) => (
                            <Link
                                key={judge.id}
                                to={`/profile/${judge.username}`}
                                className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/10 group"
                            >
                                <Avatar className="size-8 transition-transform duration-200 group-hover:scale-110">
                                    <AvatarImage src={judge.avatarUrl} alt={judge.username} />
                                    <AvatarFallback className="text-xs bg-muted/50">
                                        {getInitials(judge.username)}
                                    </AvatarFallback>
                                </Avatar>

                                <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                    {judge.username}
                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}