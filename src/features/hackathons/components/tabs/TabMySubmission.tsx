
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store.ts";
import {
    useGetMyHackathonProjectsQuery,
    useRemoveProjectMutation,
    useSubmitProjectMutation
} from "../../api/hackathonApi.ts";
import { useGetMyProjectsQuery } from "../../../project/api/projectApi.ts";

import Loading from "../../../../components/Loading.tsx";
import ErrorMessage from "../../../../components/ErrorMessage.tsx";
import Button from "../../../../components/Button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/Select.tsx";
import ProjectCard from "../../../../components/ProjectCard.tsx";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import {useMemo, useState} from "react";

const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};
interface TabMySubmissionProps {
    hackathonId: string;
    hackathonStatus: string;
}

export function TabMySubmission({ hackathonId,hackathonStatus }: TabMySubmissionProps) {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

    const {
        data: submittedProjectsData,
        isLoading: isLoadingSubmitted,
        isError: isSubmittedError
    } = useGetMyHackathonProjectsQuery(hackathonId, {
        skip: !hackathonId,
    });
    const submittedProjects = Array.isArray(submittedProjectsData) ? submittedProjectsData : [];

    const {
        data: allMyProjectsData,
        isLoading: isLoadingAllProjects,
        isError: isAllProjectsError
    } = useGetMyProjectsQuery(currentUserId!, {
        skip: !currentUserId,
    });
    const allMyProjects = Array.isArray(allMyProjectsData) ? allMyProjectsData : [];

    const [submitProject, { isLoading: isSubmitting }] = useSubmitProjectMutation();
    const [removeProject, { isLoading: isRemoving }] = useRemoveProjectMutation();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);

    const { availableProjects, publishedProjectsCount } = useMemo(() => {
        const submittedProjectIds = new Set(
            submittedProjects.map((sp) => sp.id)
        );

        const publishedProjects = allMyProjects.filter(
            (p: any) => p.status === 'PUBLISHED'
        );

        const available = publishedProjects.filter(
            (p) => !submittedProjectIds.has(p.id)
        );

        return {
            availableProjects: available,
            publishedProjectsCount: publishedProjects.length
        };
    }, [allMyProjects, submittedProjects]);


    const handleSubmit = async () => {
        if (!selectedProjectId || isSubmitting) return;
        try {
            await submitProject({
                hackathonId,
                body: { projectId: selectedProjectId }
            }).unwrap();
            setSelectedProjectId(null);
        } catch (err) {
            alert("Помилка: " + (err as any).data?.message || "Не вдалося подати проект.");
        }
    };

    const handleRemove = async (hackathonProjectId: string) => {
        if (isRemoving) return;
        setRemovingProjectId(hackathonProjectId);
        try {
            await removeProject(hackathonProjectId).unwrap();
        } catch (err) {
            alert("Помилка: " + (err as any).data?.message || "Не вдалося видалити проект.");
        } finally {
            setRemovingProjectId(null);
        }
    };


    if (isLoadingSubmitted || isLoadingAllProjects) {
        return <Loading text="Завантаження ваших проектів..." />;
    }

    if (isSubmittedError || isAllProjectsError) {
        return <ErrorMessage title="Помилка" message="Не вдалося завантажити ваші проекти." />;
    }

    const getSubmitFormMessage = () => {
        if (hackathonStatus !== 'OPEN') {
            return `Прийом проектів завершено. Статус хакатону: ${hackathonStatus}.`;
        }
        if (publishedProjectsCount === 0) {
            return "У вас немає опублікованих проектів, які можна подати.";
        }
        if (availableProjects.length === 0) {
            return "Усі ваші опубліковані проекти вже подані на цей хакатон.";
        }
        return "Оберіть один зі своїх проектів для участі.";
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
                <div className="max-w-md mx-auto text-center">
                    <UploadCloud className="size-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-4">Подати проект</h3>

                    <p className="text-muted-foreground mb-4 text-sm">
                        {getSubmitFormMessage()}
                    </p>

                    {hackathonStatus === 'OPEN' ? (
                        <>
                            {publishedProjectsCount === 0 && (
                                <Button variant="secondary">
                                    Створити новий проект
                                </Button>
                            )}

                            {availableProjects.length > 0 && (
                                <>
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
                                        className="mt-6 w-full justify-center"
                                        onClick={handleSubmit}
                                        disabled={!selectedProjectId || isSubmitting}
                                    >
                                        {isSubmitting ? "Відправка..." : "Подати обраний проект"}
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <p className="text-yellow-400 font-medium text-center">
                            Прийом проектів закрито.
                        </p>
                    )}
                </div>
            </div>

            {/* БЛОК 2: Список поданих проектів */}
            <div>
                <h3 className="text-2xl font-semibold mb-4">Ваші подані проекти ({submittedProjects.length})</h3>
                {submittedProjects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                        Ви ще не подали жодного проекту на цей хакатон.
                    </p>
                ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                        >
                        {submittedProjects.map((submission) => (
                            <motion.div
                                key={submission.hpId}
                                variants={cardVariants}
                                className="flex flex-col gap-3"
                            >
                                <div key={submission.hpId} className="flex flex-col gap-3">
                                    <ProjectCard project={submission} />
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemove(submission.hpId)}
                                        disabled={isRemoving && removingProjectId === submission.hpId}
                                        className="w-full py-2"
                                    >
                                        {isRemoving && removingProjectId === submission.hpId
                                            ? "Видалення..."
                                            : "Видалити проект"}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                        </motion.div>
                )}
            </div>
        </div>
    );
}