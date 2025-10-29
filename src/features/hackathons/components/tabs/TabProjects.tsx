// features/hackathon/components/view/tabs/TabProjects.tsx
import React from "react";
import ProjectCard from "../../../../components/ProjectCard.tsx"; // <-- Твій компонент картки
import { Info } from "lucide-react";
import type {Project} from "../../../../shared/types/Project.ts"; // Іконка для "пустого" стану

export function TabProjects({ projects }: { projects: Project[] }) {

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl text-muted-foreground">
                <Info className="size-12" />
                <h3 className="text-xl font-semibold">Проекти ще не подано</h3>
                <p className="max-w-md text-center">Щойно учасники почнуть подавати свої роботи, вони з'являться тут. Будь першим!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((hackathonProject) => (
                // Передаємо 'project' з 'hackathonProject' у твій ProjectCard
                <ProjectCard
                    key={hackathonProject.id}
                    project={hackathonProject.project}
                    // Тут ти можеш додати пропси для відображення рейтингу, якщо картка це підтримує
                    // averageRating={...}
                />
            ))}
        </div>
    );
}