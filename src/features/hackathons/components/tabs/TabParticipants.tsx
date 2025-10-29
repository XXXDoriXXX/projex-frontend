// features/hackathon/components/view/tabs/TabParticipants.tsx
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/avatar.tsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Тип учасника з твого hackathon.types.ts
type Participant = {
    user: {
        id: string;
        username: string;
        avatarUrl?: string | null;
    };
};

export function TabParticipants({ participants }: { participants: Participant[] }) {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((participant, index) => (
                <motion.div
                    key={participant.user.id}
                    className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-4 flex flex-col items-center gap-3
                               hover:border-primary/50 hover:shadow-primary/20 hover:shadow-lg transition-all duration-300
                               cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/profile/${participant.user.username}`)} // Перехід на профіль
                >
                    <Avatar className="size-16 border-2 border-primary/30">
                        <AvatarImage src={participant.user.avatarUrl || undefined} alt={participant.user.username} />
                        <AvatarFallback className="text-xl">
                            {participant.user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground font-semibold text-center truncate w-full">
                        {participant.user.username}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}