
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

import { Calendar, CheckCircle, Clock, Star } from 'lucide-react';
import type {SimpleHackathon} from "../../api/hackathonApi.ts";

interface HackathonCardProps {
    hackathon: SimpleHackathon;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const getStatusInfo = (status: string) => {
    switch (status) {
        case "OPEN":
            return { text: "Відкрито", icon: CheckCircle, color: "text-green-400" };
        case "RATING":
            return { text: "Оцінювання", icon: Star, color: "text-blue-400" };
        case "CLOSED":
            return { text: "Завершено", icon: Clock, color: "text-yellow-400" };
        default:
            return { text: "В архіві", icon: Clock, color: "text-muted-foreground" };
    }
};

const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon }) => {
    const status = getStatusInfo(hackathon.status);

    return (
        <motion.div
            variants={cardVariants}
            className="w-full"
        >
            <Link
                to={`/hackathon/view/${hackathon.id}`}
                className="block bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-5
                           transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20
                           hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <motion.div
                    className="flex flex-col h-full"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >

                    <div className="mb-3">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                            <status.icon className="size-3.5" />
                            {status.text}
                        </span>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-2 truncate" title={hackathon.title}>
                        {hackathon.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Автор: <span className="font-medium text-foreground/80">{hackathon.authorId}</span>
                    </p>

                    <div className="mt-auto space-y-2 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>
                                {format(new Date(hackathon.startDate), "dd MMM", { locale: uk })}
                                {' - '}
                                {format(new Date(hackathon.endDate), "dd MMM yyyy", { locale: uk })}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default React.memo(HackathonCard);