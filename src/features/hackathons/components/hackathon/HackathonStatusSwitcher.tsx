import { useState } from "react";
import { useUpdateHackathonStatusMutation, type HackathonStatus } from "../../api/hackathonApi.ts";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Loader2 } from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../../components/Select.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "../../../../components/AlertDialog.tsx";

interface Props {
    hackathonId: string;
    currentStatus: HackathonStatus;
}

const statusConfig = {
    OPEN: {
        label: "Відкритий",
        warningTitle: "",
        warningMessage: "",
    },
    RATING: {
        label: "Оцінювання",
        warningTitle: "Перевести в режим 'Оцінювання'?",
        warningMessage: "Це заблокує подачу нових проектів та відкриє можливість голосування для суддів (та учасників/публіки, якщо це дозволено). Ви впевнені?",
    },
    CLOSED: {
        label: "Закритий",
        warningTitle: "Закрити хакатон?",
        warningMessage: "УВАГА! Це завершить подію. Результати будуть фіналізовані, і подальші зміни (включно з оцінюванням) стануть неможливими. Продовжити?",
    },
    ARCHIVED: {
        label: "Архівувати",
        warningTitle: "Архівувати хакатон?",
        warningMessage: "НЕБЕЗПЕКА! Ця дія схожа на видалення. Хакатон буде приховано з публічного доступу. Цю дію неможливо буде легко скасувати. Ви точно впевнені?",
    },
};

export function HackathonStatusSwitcher({ hackathonId, currentStatus }: Props) {
    const [pendingStatus, setPendingStatus] = useState<HackathonStatus | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [updateStatus, { isLoading }] = useUpdateHackathonStatusMutation();

    const handleSelection = (newStatus: HackathonStatus) => {
        if (newStatus === currentStatus) return;

        if (newStatus === "RATING" || newStatus === "CLOSED" || newStatus === "ARCHIVED") {
            setPendingStatus(newStatus);
            setIsDialogOpen(true);
        } else {
            void handleConfirmUpdate(newStatus);
        }
    };

    const handleConfirmUpdate = async (statusToUpdate: HackathonStatus) => {
        setIsDialogOpen(false);
        setPendingStatus(null);

        const statusLabel = statusConfig[statusToUpdate].label;
        toast.promise(
            updateStatus({ id: hackathonId, status: statusToUpdate }).unwrap(),
            {
                loading: "Оновлення статусу...",
                success: `Статус хакатону оновлено на "${statusLabel}"!`,
                error: "Не вдалося оновити статус.",
            }
        );
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setPendingStatus(null);
    };

    const dialogConfig = pendingStatus ? statusConfig[pendingStatus] : null;

    return (
        <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Select
                    value={currentStatus}
                    onValueChange={(value: HackathonStatus) => handleSelection(value)}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-[180px] bg-card/50 backdrop-blur-sm">
                        <SelectValue placeholder="Змінити статус..." />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(statusConfig).map((statusKey) => (
                            <SelectItem key={statusKey} value={statusKey}>
                                {statusConfig[statusKey as HackathonStatus].label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </motion.div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogConfig?.warningTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogConfig?.warningMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
                            Скасувати
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => void handleConfirmUpdate(pendingStatus!)}
                            disabled={isLoading}
                            className={pendingStatus === 'ARCHIVED' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Так, підтвердити
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}