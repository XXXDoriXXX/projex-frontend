// features/hackathon/components/view/tabs/TabMySubmission.tsx
import React, { useState } from "react";

import Loading from "../../../../components/Loading.tsx";
import ErrorMessage from "../../../../components/ErrorMessage.tsx";
import Button from "../../../../components/Button.tsx";

import { CheckCircle, UploadCloud, XCircle } from "lucide-react";

interface TabMySubmissionProps {
    hackathonId: string;
    userSubmission?: HackathonProjectWithDetails;
}

export function TabMySubmission({ hackathonId, userSubmission }: TabMySubmissionProps) {
    // 1. Отримуємо проекти поточного користувача
    const { data: myProjects, isLoading: isLoadingProjects, isError: isProjectsError } = useGetMyProjectsQuery();

    // 2. Мутації для подачі / видалення
    const [submitProject, { isLoading: isSubmitting }] = useSubmitProjectMutation();
    const [removeProject, { isLoading: isRemoving }] = useRemoveProjectMutation();

    // 3. Локальний стан для вибору
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedProjectId || isSubmitting) return;
        try {
            await submitProject({
                hackathonId,
                body: { projectId: selectedProjectId }
            }).unwrap();
            setSelectedProjectId(null); // Скидаємо вибір
        } catch (err) {
            alert("Помилка: " + (err as any).data?.message || "Не вдалося подати проект.");
        }
    };

    const handleRemove = async () => {
        if (!userSubmission || isRemoving) return;
        try {
            await removeProject(userSubmission.id).unwrap();
        } catch (err) {
            alert("Помилка: " + (err as any).data?.message || "Не вдалося видалити проект.");
        }
    };

    // --- Рендеринг ---

    if (isLoadingProjects) {
        return <Loading text="Завантаження ваших проектів..." />;
    }

    if (isProjectsError || !myProjects) {
        return <ErrorMessage title="Помилка" message="Не вдалося завантажити ваші проекти." />;
    }

    // Стан 1: Проект ВЖЕ ПОДАНО
    if (userSubmission) {
        return (
            <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6 text-center">
                <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Ви вже подали проект!</h3>
                <p className="text-lg text-foreground mb-6">
                    Ваша робота: <span className="text-primary font-bold">{userSubmission.project.title}</span>
                </p>
                <Button variant="danger" onClick={handleRemove} disabled={isRemoving}>
                    {isRemoving ? "Видалення..." : "Видалити та подати інший"}
                </Button>
            </div>
        );
    }

    // Стан 2: Проект ЩЕ НЕ ПОДАНО
    const availableProjects = myProjects.filter(p => p.status === 'PUBLISHED'); // Можна подати лише опубліковані

    return (
        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
            <div className="max-w-md mx-auto text-center">
                <UploadCloud className="size-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Подати проект на хакатон</h3>

                {availableProjects.length === 0 ? (
                    <>
                        <p className="text-muted-foreground mb-4">
                            У вас немає опублікованих проектів, які можна подати.
                        </p>
                        <Button variant="secondary" /* onClick={() => navigate('/create-project')} */>
                            Створити новий проект
                        </Button>
                    </>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-4">
                            Оберіть один зі своїх опублікованих проектів для участі.
                        </p>
                        <Select onValueChange={setSelectedProjectId} value={selectedProjectId || ""}>
                            <SelectTrigger className="w-full bg-secondary/50 rounded-lg">
                                <SelectValue placeholder="Оберіть ваш проект..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card/90 backdrop-blur-xl border-border/50">
                                {availableProjects.map(project => (
                                    <SelectItem key={project.id} value={project.id} className="cursor-pointer">
                                        {project.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="primary"
                            className="mt-6"
                            onClick={handleSubmit}
                            disabled={!selectedProjectId || isSubmitting}
                        >
                            {isSubmitting ? "Відправка..." : "Подати проект"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}