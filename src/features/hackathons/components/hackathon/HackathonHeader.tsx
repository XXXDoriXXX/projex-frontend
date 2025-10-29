
import Button from "../../../../components/Button.tsx";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {Calendar, Users, Trophy, CheckCircle, Clock, Star} from "lucide-react";
import { motion } from "framer-motion";
import type {HackathonWithDetails} from "../../api/hackathonApi.ts";

interface HackathonHeaderProps {
    hackathon: HackathonWithDetails;
    isParticipant: boolean;
    isAuthor: boolean;
    onJoin: () => void;
    onLeave: () => void;
    isLoading: boolean;
}

const InfoCard = ({ icon: Icon, title, value }: any) => (
    <motion.div
        className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-4 flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
    >
        <div className="size-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Icon className="size-5 text-white" />
        </div>
        <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    </motion.div>
);

export function HackathonHeader({ hackathon, isParticipant, isAuthor, onJoin, onLeave, isLoading }: HackathonHeaderProps) {

    const getStatusInfo = () => {
        switch (hackathon.status) {
            case "OPEN": return { text: "Відкрито", icon: CheckCircle, color: "text-green-400" };
            case "RATING": return { text: "Іде оцінювання", icon: Star, color: "text-blue-400" };
            case "CLOSED": return { text: "Завершено", icon: Trophy, color: "text-yellow-400" };
            case "ARCHIVED": return { text: "В архіві", icon: Clock, color: "text-muted-foreground" };
            default: return { text: "Невідомо", icon: Clock, color: "text-muted-foreground" };
        }
    };

    const status = getStatusInfo();

    return (
        <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
        >
            <motion.h1
                className="text-4xl md:text-6xl font-bold text-foreground mb-4"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
                {hackathon.title}
            </motion.h1>

            <motion.p
                className="text-lg text-muted-foreground max-w-3xl mb-6"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
                {hackathon.description}
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <InfoCard
                    icon={Calendar}
                    title="Дата початку"
                    value={format(new Date(hackathon.startDate), "dd MMMM yyyy", { locale: uk })}
                />
                <InfoCard
                    icon={Trophy}
                    title="Статус"
                    value={<span className={status.color}>{status.text}</span>}
                />
                <InfoCard
                    icon={Users}
                    title="Учасників"
                    value={hackathon.participants.length}
                />
                <InfoCard
                    icon={Trophy}
                    title="Призовий фонд"
                    value="$10,000"
                />
            </div>

            {/* Кнопки Дій */}
            <motion.div
                className="flex gap-4"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
                {isAuthor && (
                    <Button variant="secondary">Керувати хакатоном</Button>
                )}

                {!isAuthor && isParticipant && (
                    <Button
                        variant="ghost"
                        onClick={onLeave}
                        disabled={isLoading}
                    >
                        {isLoading ? "Виходимо..." : "Покинути хакатон"}
                    </Button>
                )}

                {!isAuthor && !isParticipant && hackathon.status === 'OPEN' && (
                    <Button
                        variant="primary"
                        onClick={onJoin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Приєднуємось..." : "Взяти участь"}
                    </Button>
                )}

                {!isAuthor && !isParticipant && hackathon.status !== 'OPEN' && (
                    <Button variant="secondary" disabled>
                        {hackathon.status === 'RATING' ? "Реєстрацію закрито (йде оцінювання)" : "Реєстрацію закрито"}
                    </Button>
                )}
            </motion.div>
        </motion.div>
    );
}