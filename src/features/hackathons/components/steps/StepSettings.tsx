import {Settings} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import {Switch} from "../../../../components/switch.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";

export function StepSettings(){
    const {
        allowParticipantRating,
        setAllowParticipantRating,
        allowPublicRating,
        setAllowPublicRating,
    } = useCreateHackathon();
    return (<div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Settings className="size-6 text-white" />
            </div>
            <div>
                <h2>Налаштування оцінювання</h2>
                <p className="text-muted-foreground">Хто може оцінювати проекти</p>
            </div>
        </div>

        <div className="space-y-4">
            {/* Participant Rating */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div>
                    <Label htmlFor="participantRating">Дозволити оцінювання учасниками</Label>
                    <p className="text-sm text-muted-foreground">
                        Учасники зможуть голосувати за проекти один одного.
                    </p>
                </div>
                <Switch
                    id="participantRating"
                    checked={allowParticipantRating}
                    onCheckedChange={setAllowParticipantRating}
                />
            </div>

            {/* Public Rating */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                <div>
                    <Label htmlFor="publicRating">Дозволити публічне оцінювання</Label>
                    <p className="text-sm text-muted-foreground">
                        Будь-який зареєстрований користувач зможе голосувати.
                    </p>
                </div>
                <Switch
                    id="publicRating"
                    checked={allowPublicRating}
                    onCheckedChange={setAllowPublicRating}
                />
            </div>
        </div>
    </div>)
}