"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DateRange } from "react-day-picker"
import {cn} from "../shared/utils/utils.ts";
import 'react-day-picker/dist/style.css';
// Припускаю, що ваш cn лежить тут, оновіть шлях якщо ні


type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected" | "onSelect"> & {
    selected?: DateRange
    onSelect?: (range: DateRange | undefined) => void
}

/**
 * Full-screen Range DatePicker with smooth animations and polished range highlight.
 * - Click first date -> start
 * - Click second date -> end, середина підсвічена “пилою”
 * - Стрілки зліва/справа для навігації по місяцях
 */
export function Calendar({
                             className,
                             classNames,
                             showOutsideDays = true,
                             selected,
                             onSelect,
                             numberOfMonths = 3,
                             ...props
                         }: CalendarProps) {
    // Неконтрольований режим, якщо selected не передали
    const [internal, setInternal] = React.useState<DateRange | undefined>(undefined)
    const range = selected ?? internal

    const handleSelect = (next?: DateRange) => {
        if (selected === undefined) setInternal(next)
        onSelect?.(next)
        console.log("Вибрано діапазон:", next)
    }

    // Для легкої анімації при зміні місяця
    const [month, setMonth] = React.useState<Date>(range?.from ?? new Date())
    const [animKey, setAnimKey] = React.useState<number>(0)
    const onMonthChange = (m: Date) => {
        setMonth(m)
        // тригеримо “fade slide” анімацію
        setAnimKey((k) => k + 1)
    }

    return (
        <div
            className={cn(
                "min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#121212] p-4",
                className
            )}
        >
            <div
                key={animKey}
                className={cn(
                    "relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl",
                    "ring-1 ring-white/25 transition-all duration-300",
                    "animate-[fadeSlide_240ms_ease-out]"
                )}
            ><div className="w-full overflow-x-auto overscroll-x-contain snap-x snap-mandatory">
                <div className="min-w-max">
                    <DayPicker
                        mode="range"
                        month={month}
                        onMonthChange={onMonthChange}
                        showOutsideDays={showOutsideDays}
                        selected={range}
                        onSelect={handleSelect}
                        numberOfMonths={numberOfMonths}
                        weekStartsOn={1}
                        pagedNavigation
                        // ВАЖЛИВО: !text-purple-50 для базового тексту
                        className={cn("p-4 sm:p-6 select-none !text-purple-50")}
                        classNames={{
                            day:  "relative z-10 inline-flex items-center justify-center h-10 w-10 rounded-xl text-sm font-medium transition-all hover:scale-[1.04]",
                            range_start:  "before:content-[''] before:absolute before:inset-y-1 before:left-1/2 before:right-0 before:bg-emerald-500/20 before:rounded-l-md before:backdrop-blur-[1px]",
                            range_end:    "before:content-[''] before:absolute before:inset-y-1 before:left-0   before:right-1/2 before:bg-emerald-500/20 before:rounded-r-md before:backdrop-blur-[1px]",
                            range_middle: "before:content-[''] before:absolute before:inset-y-1 before:left-0   before:right-0   before:bg-emerald-500/20 before:rounded-md   before:backdrop-blur-[1px]",

                            /* КНОПКА ДНЯ: градієнт на самій кнопці */
                            day_range_start:  "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.04]",
                            day_range_end:    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.04]",
                            day_range_middle: "text-white", // якщо треба текст у середині
                            ...classNames,
                        }}
                        components={{
                            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                            IconRight: () => <ChevronRight className="h-4 w-4" />,
                        }}
                        {...props}
                    />
                </div>
            </div>
            </div>

            {/* Tailwind keyframes для fade+slide при зміні місяця */}
            <style jsx>{`
                @keyframes fadeSlide {
                    0% { opacity: 0; transform: translateY(6px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

Calendar.displayName = "Calendar"
export default Calendar

