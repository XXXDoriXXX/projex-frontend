
import Loading from "../../../../components/Loading.tsx";
import ErrorMessage from "../../../../components/ErrorMessage.tsx";
import { Trophy } from "lucide-react";
import {useGetLeaderboardQuery} from "../../api/hackathonApi.ts";

export function TabLeaderboard({ hackathonId }: { hackathonId: string }) {
    const { data: leaderboard, isLoading, isError } = useGetLeaderboardQuery(hackathonId);

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
        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold mb-4">Таблиця Лідерів</h3>
            <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                    <div
                        key={entry.projectId}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold w-6">
                                {index === 0 ? <Trophy className="text-yellow-400" /> : `#${index + 1}`}
                            </span>
                            <span className="text-foreground">{entry.projectTitle}</span>
                        </div>
                        <span className="text-primary font-semibold">{entry.totalScore.toFixed(2)} балів</span>
                    </div>
                ))}
            </div>
        </div>
    );
}