
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store.ts";
import { motion } from "framer-motion";

import {
    useGetHackathonByIdQuery,
    useJoinHackathonMutation,
    useLeaveHackathonMutation
} from "../api/hackathonApi.ts";

import Loading from "../../../components/Loading.tsx";
import ErrorMessage from "../../../components/ErrorMessage.tsx";
import { HackathonTabs } from "../components/hackathon/HackathonTabs.tsx";
import { HackathonHeader } from "../components/hackathon/HackathonHeader.tsx";
import {TabOverview} from "../components/tabs/TabOverview.tsx";
import {TabLeaderboard} from "../components/tabs/TabLeaderboard.tsx";
import {TabProjects} from "../components/tabs/TabProjects.tsx";
import {TabParticipants} from "../components/tabs/TabParticipants.tsx";
import {TabRating} from "../components/tabs/TabRating.tsx";
import {TabMySubmission} from "../components/tabs/TabMySubmission.tsx";
import {useState} from "react";

export type HackathonTab = "overview" | "projects" | "participants" | "leaderboard" | "submission" | "rating";

export function HackathonPage() {
    const { id: hackathonId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    const [activeTab, setActiveTab] = useState<HackathonTab>("overview");

    if(!hackathonId) {
        console.log(hackathonId);
    }
    if(!currentUserId) {
        console.log(hackathonId);
    }

    const { data: hackathon, isLoading, isError, error } =
        useGetHackathonByIdQuery(hackathonId!, {
            skip: !hackathonId,
        });

    const [joinHackathon, { isLoading: isJoining }] = useJoinHackathonMutation();
    const [leaveHackathon, { isLoading: isLeaving }] = useLeaveHackathonMutation();

    if (isLoading) {
        return <Loading fullScreen text='Завантаження хакатону...' />;
    }

    if (isError || !hackathon) {
        return <ErrorMessage fullScreen title="Помилка" message='Не вдалося завантажити хакатон.' onRetry={() => navigate(0)} />;
    }

    const isParticipant = hackathon.participants.some((p: any) => p.user.id === currentUserId);

    const isAuthor = hackathon.author.id === currentUserId;

    const isJudge = hackathon.judges.some((j: any) => j.id === currentUserId);

    const canRateAsParticipant = isParticipant && hackathon.allowParticipantRating;
    const isPublicUser = !isParticipant && !isJudge && !isAuthor;
    const canRateAsPublic = isPublicUser && hackathon.allowPublicRating;
    const canRate = isJudge || canRateAsParticipant || canRateAsPublic;
    const handleJoin = async () => {
        if (isJoining) return;
        try {
            await joinHackathon(hackathonId!).unwrap();
        } catch (err:any) {
            alert("Не вдалося приєднатися до хакатону.");
        }
    };

    const handleLeave = async () => {
        if (isLeaving) return;
        try {
            await leaveHackathon(hackathonId!).unwrap();
        } catch (err:any) {
            alert("Не вдалося покинути хакатон.");
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <TabOverview hackathon={hackathon} />;
            case "leaderboard":
                return <TabLeaderboard hackathonId={hackathonId!} />;
            case "projects":
                return <TabProjects projects={hackathon.projects} />;
            case "participants":
                return <TabParticipants participants={hackathon.participants} />;
            case "submission":
                return <TabMySubmission hackathonId={hackathonId!} hackathonStatus={hackathon.status} />;
            case "rating":
                return <TabRating
                    hackathonId={hackathonId!}
                    projects={hackathon.projects}
                    categories={hackathon.ratingCategories}
                    canRate={canRate}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 z-0" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-4 py-24">

                <HackathonHeader
                    hackathon={hackathon}
                    isParticipant={isParticipant}
                    isAuthor={isAuthor}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    isLoading={isJoining || isLeaving}
                />

                <HackathonTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isParticipant={isParticipant}
                    canRate={canRate}
                    hackathonStatus={hackathon.status}
                />

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                >
                    {renderTabContent()}
                </motion.div>
            </div>
        </div>
    );
}

export default HackathonPage;