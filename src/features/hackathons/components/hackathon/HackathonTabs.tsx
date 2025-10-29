
import { cn } from "../../../../shared/utils/utils.ts";
import type { HackathonTab } from "../../pages/HackathonPage.tsx";
import {Star} from "lucide-react";

interface HackathonTabsProps {
    activeTab: HackathonTab;
    onTabChange: (tab: HackathonTab) => void;
    isParticipant: boolean;
    canRate: boolean;
    hackathonStatus: string;
}

const tabs = [
    { id: "overview", label: "Огляд" },
    { id: "projects", label: "Проекти" },
    { id: "participants", label: "Учасники" },
    { id: "leaderboard", label: "Лідери" },
];

export function HackathonTabs({ activeTab, onTabChange, isParticipant,canRate, hackathonStatus }: HackathonTabsProps) {
    return (
        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-2 flex flex-wrap gap-2">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as HackathonTab)}
                    className={cn(
                        "py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                        activeTab === tab.id
                            ? "bg-primary/80 text-white shadow-md shadow-primary/30"
                            : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    )}
                >
                    {tab.label}
                </button>
            ))}
            {canRate && (hackathonStatus === 'RATING' || hackathonStatus === 'CLOSED') && (
                <button
                    onClick={() => onTabChange("rating")}
                    className={cn(
                        "py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        activeTab === "rating"
                            ? "bg-blue-500/80 text-white shadow-md shadow-blue-500/30"
                            : "text-blue-400 hover:bg-white/10 hover:text-blue-300"
                    )}
                >
                    <Star className="size-4" />
                    Оцінювання
                </button>
            )}
            {isParticipant && (
                <button
                    onClick={() => onTabChange("submission")}
                    className={cn(
                        "py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                        "ml-auto",
                        activeTab === "submission"
                            ? "bg-white/20 text-primary shadow-md"
                            : "text-primary/70 hover:bg-white/10 hover:text-primary"
                    )}
                >
                    My projects
                </button>
            )}
        </div>
    );
}