
import React from "react";
import { cn } from "../../../../shared/utils/utils.ts";
import type { HackathonTab } from "../../pages/HackathonPage.tsx";

interface HackathonTabsProps {
    activeTab: HackathonTab;
    onTabChange: (tab: HackathonTab) => void;
    isParticipant: boolean;
}

const tabs = [
    { id: "overview", label: "Огляд" },
    { id: "projects", label: "Проекти" },
    { id: "participants", label: "Учасники" },
    { id: "leaderboard", label: "Лідери" },
];

export function HackathonTabs({ activeTab, onTabChange, isParticipant }: HackathonTabsProps) {
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

            {/* Окрема вкладка, яка з'являється лише для учасників */}
            {isParticipant && (
                <button
                    onClick={() => onTabChange("submission")}
                    className={cn(
                        "py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                        "ml-auto", // Притискаємо вправо
                        activeTab === "submission"
                            ? "bg-white/20 text-primary shadow-md"
                            : "text-primary/70 hover:bg-white/10 hover:text-primary"
                    )}
                >
                    Мій Проект
                </button>
            )}
        </div>
    );
}