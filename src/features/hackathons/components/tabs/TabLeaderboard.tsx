
import Loading from "../../../../components/Loading.tsx";
import ErrorMessage from "../../../../components/ErrorMessage.tsx";
import {ChevronDown, Star, Trophy, User, Users} from "lucide-react";
import {useGetLeaderboardQuery, type DetailedLeaderboardEntry, type VoterType} from "../../api/hackathonApi.ts";
import {AnimatePresence, motion} from "motion/react";
import {useState} from "react";
const VoterTypeDisplay = ({ type }: { type: VoterType }) => {
    switch (type) {
        case 'JUDGE':
            return <span className="flex items-center gap-1.5"><Star className="size-4 text-yellow-400" /> Судді</span>;
        case 'PARTICIPANT':
            return <span className="flex items-center gap-1.5"><User className="size-4 text-blue-400" /> Учасники</span>;
        case 'PUBLIC':
            return <span className="flex items-center gap-1.5"><Users className="size-4 text-green-400" /> Глядачі</span>;
        default:
            return null;
    }
};
export function TabLeaderboard({ hackathonId }: { hackathonId: string }) {
    const { data: leaderboard, isLoading, isError } = useGetLeaderboardQuery(hackathonId);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    if (isLoading) {
        return <Loading text="Завантаження лідерборду..." />;
    }
    if (isError || !leaderboard) {
        return <ErrorMessage title="Помилка" message="Не вдалося завантажити лідерборд." />;
    }
    if (leaderboard.length === 0) {
        return <div className="text-center text-muted-foreground">Лідерборд ще порожній.</div>
    }


    return (
        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6 max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Таблиця Лідерів</h3>
            <div className="space-y-3">
                {leaderboard.map((entry: DetailedLeaderboardEntry, index) => {
                    const isExpanded = expandedProjectId === entry.projectId;

                    return (
                        <div
                            key={entry.projectId}
                            className="bg-secondary/30 rounded-lg border border-border/50 overflow-hidden transition-all"
                        >
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
                                onClick={() => setExpandedProjectId(isExpanded ? null : entry.projectId)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold w-6 text-center">
                                        {index === 0 ? <Trophy className="text-yellow-400 size-6" />
                                            : index === 1 ? <Trophy className="text-gray-400 size-6" />
                                                : index === 2 ? <Trophy className="text-orange-400 size-6" />
                                                    : <span className="text-muted-foreground">#{index + 1}</span>}
                                    </span>
                                    <span className="text-foreground font-medium">{entry.projectTitle}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-primary font-semibold">{entry.totalScore.toFixed(2)} балів</span>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                        <ChevronDown className="size-5 text-muted-foreground" />
                                    </motion.div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-border/50 overflow-hidden"
                                    >
                                        <div className="p-4 bg-secondary/10 space-y-5">

                                            {entry.categoryScores.map(category => (
                                                <div key={category.categoryId} className="text-sm">

                                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50">
                                                        <h5 className="font-semibold text-foreground">
                                                            {category.categoryName}
                                                        </h5>
                                                        <span className="font-bold text-primary text-base">
                                                            {category.averageScore.toFixed(2)}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5 pl-2">
                                                        {category.scoresByVoterType.map(voterScore => (
                                                            <div key={voterScore.type} className="flex justify-between items-center">
                                                                <VoterTypeDisplay type={voterScore.type} />

                                                                <span className="font-medium text-foreground/90">
                                                                    {voterScore.averageScore.toFixed(2)}
                                                                    <span className="text-xs text-muted-foreground ml-1.5">
                                                                        ({voterScore.voteCount} голосів)
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {entry.categoryScores.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center">
                                                    Деталізовані оцінки для цього проекту відсутні.
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}