import { useSelector } from "react-redux";
import type { RootState } from "../../../../store.ts";
import {
    useGetMyHackathonProjectsQuery,
    useRemoveProjectMutation,
    useSubmitProjectMutation,
    useGetLeaderboardQuery,
    useGetProjectRatingsQuery
} from "../../api/hackathonApi.ts";
import { useGetMyProjectsQuery } from "../../../project/api/projectApi.ts";

import Loading from "../../../../components/Loading.tsx";
import ErrorMessage from "../../../../components/ErrorMessage.tsx";
import Button from "../../../../components/Button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/Select.tsx";
import ProjectCard from "../../../../components/ProjectCard.tsx";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import {UploadCloud} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "../../../../components/avatar.tsx";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "../../../../components/Sheet.tsx";
import CustomTooltip from "../../../../components/CustomTooltip.tsx";

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
type ProjectRating = NonNullable<ReturnType<typeof useGetProjectRatingsQuery>['data']>[0];

function RatingCard({ rating }: { rating: ProjectRating }) {

    const getRaterTypeLabel = (type: ProjectRating['raterType']) => {
        switch (type) {
            case 'JUDGE': return 'Суддя';
            case 'PARTICIPANT': return 'Учасник';
            case 'PUBLIC': return 'Глядач';
            default: return 'Гість';
        }
    };

    return (
        <div className="bg-secondary/50 border border-border/50 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                        <AvatarImage src={rating.rater.avatarUrl || undefined} alt={rating.rater.username} />
                        <AvatarFallback>{rating.rater.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{rating.rater.username}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {getRaterTypeLabel(rating.raterType)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-3xl font-bold text-primary">
                        {rating.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {rating.comment && (
                <p className="text-sm text-foreground/90 mt-3 border-t border-border/50 pt-3">
                    {rating.comment}
                </p>
            )}
        </div>
    );
}
export function TabMySubmission({ hackathonId, hackathonStatus }: TabMySubmissionProps) {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    const [selectedHpIdForRatings, setSelectedHpIdForRatings] = useState<string | null>(null);
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

    const [submitProject, {isLoading: isSubmitting}] = useSubmitProjectMutation();
    const [removeProject, {isLoading: isRemoving}] = useRemoveProjectMutation();

    const {data: leaderboardData, isLoading: isLoadingLeaderboard} =
        useGetLeaderboardQuery(hackathonId, {
            skip: hackathonStatus === 'OPEN',
        });

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);

    const {availableProjects, publishedProjectsCount} = useMemo(() => {
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
    const projectsAnalyticsMap = useMemo(() => {
        const analytics = new Map<string, {
            chartData: any[];
            rank: number | null;
            entry: any | null;
        }>();

        console.groupCollapsed("📊 DEBUG: Leaderboard processing");
        console.log("leaderboardData:", leaderboardData);
        console.log("submittedProjects:", submittedProjects);

        const entries = Array.isArray(leaderboardData) ? leaderboardData : leaderboardData?.data ?? [];
        console.log("entries:", entries);

        if (entries.length === 0 || submittedProjects.length === 0) {
            console.warn("⛔ No entries or no submitted projects");
            console.groupEnd();
            return analytics;
        }

        for (const submission of submittedProjects) {
            const leaderboardEntry = entries.find(e => e.projectId === submission.hpId);


            console.log("➡ submission:", submission.title, "hpId:", submission.hpId);
            console.log("   matched leaderboardEntry:", leaderboardEntry);

            if (!leaderboardEntry) {
                analytics.set(submission.hpId, { chartData: [], rank: null, entry: null });
                continue;
            }

            const rank = entries.indexOf(leaderboardEntry);
            const currentRank = rank !== -1 ? rank + 1 : null;

            const chartData = leaderboardEntry.categoryScores.map((category) => {
                const point: Record<string, number | string> = {
                    criterion: category.categoryName,
                };

                for (const score of category.scoresByVoterType) {
                    point[score.type] = parseFloat(score.averageScore.toFixed(2));
                }

                if (point["JUDGE"] === undefined) point["JUDGE"] = 0;
                if (point["PARTICIPANT"] === undefined) point["PARTICIPANT"] = 0;
                if (point["PUBLIC"] === undefined) point["PUBLIC"] = 0;

                console.log("   ✅ category:", category.categoryName, "→", point);
                return point;
            });

            console.log("   chartData built:", chartData);

            analytics.set(submission.hpId, {
                chartData,
                rank: currentRank,
                entry: leaderboardEntry,
            });
        }

        console.groupEnd();
        return analytics;
    }, [leaderboardData, submittedProjects]);

    const handleSubmit = async () => {
        if (!selectedProjectId || isSubmitting) return;
        try {
            await submitProject({
                hackathonId,
                body: {projectId: selectedProjectId}
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

    type ProjectRatingsContentProps = {
        hpId: string | null;
    };

    function ProjectRatingsContent({ hpId }: ProjectRatingsContentProps) {
        const {
            data: ratingsData,
            isLoading,
            isError,
        } = useGetProjectRatingsQuery(hpId!, {
            skip: !hpId,
        });

        const ratings = Array.isArray(ratingsData) ? ratingsData : [];

        if (isLoading) {
            return <Loading text="Завантаження відгуків..." />;
        }
        if (isError) {
            return <ErrorMessage title="Помилка" message="Не вдалося завантажити відгуки." />;
        }
        if (ratings.length === 0) {
            return (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Для цього проекту ще немає відгуків.</p>
                </div>
            );
        }

        const groupedRatings = ratings.reduce((acc, rating) => {
            const categoryName = rating.category.name || 'Загальне';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(rating);
            return acc;
        }, {} as Record<string, typeof ratings>);


        return (
            <div className="flex flex-col gap-8">
                {Object.entries(groupedRatings).map(([categoryName, categoryRatings]) => (
                    <div key={categoryName}>
                        <h4 className="text-lg font-semibold text-primary mb-3 sticky top-0 bg-card py-2 border-b border-border z-10">
                            {categoryName}
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({categoryRatings.length} відг.)
                        </span>
                        </h4>
                        <div className="flex flex-col gap-4">
                            {categoryRatings.map((rating) => (
                                <RatingCard key={rating.id} rating={rating} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (isLoadingSubmitted || isLoadingAllProjects || (hackathonStatus !== 'OPEN' && isLoadingLeaderboard)) {
        return <Loading text="Завантаження ваших проектів..."/>;
    }

    if (isSubmittedError || isAllProjectsError) {
        return <ErrorMessage title="Помилка" message="Не вдалося завантажити ваші проекти."/>;
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
                    <UploadCloud className="size-12 text-primary mx-auto mb-4"/>
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
                                            <SelectValue placeholder="Оберіть ваш проект..."/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border/50">
                                            {availableProjects.map(project => (
                                                <SelectItem key={project.id} value={project.id}
                                                            className="cursor-pointer">
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
                        {submittedProjects.map((submission) => {
                            const analytics = projectsAnalyticsMap.get(submission.hpId) ||
                                {chartData: [], rank: null, entry: null};

                            const {chartData, rank: currentRank, entry: leaderboardEntry} = analytics;

                            return (
                                <motion.div
                                    key={submission.hpId}
                                    variants={cardVariants}
                                    className="flex flex-col gap-3"
                                >
                                    {leaderboardEntry && (
                                        <div
                                            className="flex justify-between items-center bg-secondary/30 p-3 rounded-lg border border-border/50">
                                            <div className="text-center">
                                                <span className="text-xs text-muted-foreground">Місце</span>
                                                <span
                                                    className="text-2xl font-bold text-primary block">{currentRank}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs text-muted-foreground">Загальний бал</span>
                                                <span className="text-2xl font-bold text-foreground block">
                                                {leaderboardEntry.totalScore.toFixed(2)}
                                            </span>
                                            </div>
                                        </div>
                                    )}
                                    {leaderboardEntry && chartData.length > 0 && (
                                        <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                                            <h5 className="text-base font-medium text-foreground mb-4 text-center">
                                                Розподіл балів
                                            </h5>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart
                                                    data={chartData}
                                                    margin={{
                                                        top: 5,
                                                        right: 0,
                                                        left: -10,
                                                        bottom: 5,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="hsl(var(--border) / 0.5)"
                                                        vertical={false}
                                                    />

                                                    <XAxis
                                                        dataKey="criterion"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#A1A1A1FF', fontSize: 12 }}
                                                    />


                                                    <YAxis
                                                        domain={[0, 10]}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#A1A1A1FF', fontSize: 12 }}
                                                        stroke="hsl(var(--border) / 0.5)"
                                                    />


                                                    <Tooltip
                                                        content={<CustomTooltip />}
                                                        cursor={{ fill: '#0d1319', radius:16, strokeWidth: 2, opacity: 0.5 }}
                                                    />

                                                    <Legend
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        iconSize={14}
                                                        formatter={(value) => (
                                                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>{value}</span>
                                                        )}
                                                    />
                                                    <Bar name="Судді" dataKey="JUDGE" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                                                    <Bar name="Учасники" dataKey="PARTICIPANT" fill="#0088FE" radius={[4, 4, 0, 0]} />
                                                    <Bar name="Глядачі" dataKey="PUBLIC" fill="#00C49F" radius={[4, 4, 0, 0]} />

                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}

                                    <div
                                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                                        onClick={() => setSelectedHpIdForRatings(submission.hpId)}
                                    >
                                        <ProjectCard project={submission} onClick={()=>{}}/>
                                    </div>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemove(submission.hpId)}
                                        disabled={
                                            (isRemoving && removingProjectId === submission.hpId) ||
                                            hackathonStatus !== 'OPEN'
                                        }
                                        className="w-full py-2"
                                    >
                                        {isRemoving && removingProjectId === submission.hpId
                                            ? "Видалення..."
                                            : "Видалити проект"}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
            <Sheet
                open={!!selectedHpIdForRatings}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedHpIdForRatings(null);
                    }
                }}
            >
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Відгуки по проекту</SheetTitle>
                        <SheetDescription>
                            Детальна інформація про оцінки та коментарі від суддів,
                            учасників та глядачів.
                        </SheetDescription>
                    </SheetHeader>

                    <ProjectRatingsContent hpId={selectedHpIdForRatings} />
                </SheetContent>
            </Sheet>
        </div>
    );
}