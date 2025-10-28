"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import {cn} from "../shared/utils/utils.ts";

// Переконайся, що шлях до utils вірний
// Припускаємо, що твій Button.tsx експортує 'buttonVariants'
// Якщо ні, я додам стилі прямо сюди.
// import { buttonVariants } from "./Button.tsx"

// Спрощена версія buttonVariants, якщо ти не можеш її імпортувати
const buttonGhostVariant = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-secondary/70 h-10 px-4 py-2"


type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      ...props
                  }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonGhostVariant, // Використовуємо стилі "ghost" кнопки
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
                day: cn(
                    buttonGhostVariant, // Використовуємо стилі "ghost" кнопки
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg"
                ),
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-secondary/70 text-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-primary/10 aria-selected:text-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }