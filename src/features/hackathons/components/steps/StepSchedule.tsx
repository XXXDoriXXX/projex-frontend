import {Calendar as CalendarIcon, CalendarDays} from "lucide-react";
import {differenceInDays, format} from "date-fns";
import {Calendar} from "../../../../components/calendar.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";
import {uk} from "date-fns/locale";

export function StepSchedule(){
    const {
        dateRange,
        setDateRange
    } = useCreateHackathon();
    let duration = 0;
    if (dateRange?.from && dateRange?.to) {
        duration = differenceInDays(dateRange.to, dateRange.from) + 1;
    }
    return (<div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <CalendarDays className="size-6 text-white" />
            </div>
            <div>
                <h2>Дати проведення</h2>
                <p className="text-muted-foreground">Вкажіть дати початку та завершення</p>
            </div>
        </div>

        <div className="flex flex-col items-center gap-4">
            <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={window.innerWidth < 768 ? 1 : 2}

                disabled={{ before: new Date() }}
                locale={uk}

                className="rounded-2xl bg-secondary/30 border border-border/50 p-4 max-w-full sm:max-w-fit"
            />
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 w-full text-center">
                {!dateRange?.from && (
                    <p className="text-muted-foreground">Оберіть дату початку</p>
                )}
                {dateRange?.from && !dateRange.to && (
                    <p className="text-muted-foreground">Обрано початок: {format(dateRange.from, "PPP", { locale: uk })}. Тепер оберіть дату завершення.</p>
                )}
                {dateRange?.from && dateRange.to && (
                    <div className="text-foreground">
                        <p>Початок: <span className="font-semibold text-primary">{format(dateRange.from, "PPP", { locale: uk })}</span></p>
                        <p>Кінець: <span className="font-semibold text-primary">{format(dateRange.to, "PPP", { locale: uk })}</span></p>
                        <p className="text-sm text-muted-foreground mt-2">Загальна тривалість: {duration} {duration === 1 ? 'день' : (duration > 1 && duration < 5) ? 'дні' : 'днів'}</p>
                    </div>
                )}
            </div>
        </div>
    </div>)
}