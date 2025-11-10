"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {DayPicker, type DateRange, type Locale} from "react-day-picker"
import { cn } from "../shared/utils/utils.ts"
import 'react-day-picker/dist/style.css'
import { uk } from 'date-fns/locale';

const DAY_SIZE_MOBILE = '32px';
const BUTTON_SIZE_MOBILE = '30px';
const DAY_SIZE_DESKTOP = '40px';
const BUTTON_SIZE_DESKTOP = '38px';

const formatWeekdayName = (date: Date, options: { locale?: Locale }) => {
    return date.toLocaleDateString(options.locale?.code || 'uk-UA', {
        weekday: 'short',
    }).replace('.', '');
};

type CalendarProps = Omit<
    React.ComponentProps<typeof DayPicker>,
    "mode" | "selected" | "onSelect" | "pagedNavigation" | "min" | "max" | "fromDate" | "toDate" | "locale" | "formatters"
> & {
    selected?: DateRange
    onSelect?: (range: DateRange | undefined) => void
    weekStartsOn?: number
    minRangeLength?: number
    maxRangeLength?: number
    disabledAfter?: Date
    disabledBefore?: Date
    baseNumberOfMonths?: number
}

export function Calendar({
                             className,
                             classNames,
                             showOutsideDays = true,
                             selected,
                             onSelect,
                             weekStartsOn = 1,
                             minRangeLength,
                             maxRangeLength,
                             disabledAfter,
                             disabledBefore,
                             baseNumberOfMonths = 3,
                             ...props
                         }: CalendarProps) {
    const disabledDates = {
        before: disabledBefore,
        after: disabledAfter,
    }

    const [monthsToShow, setMonthsToShow] = React.useState(baseNumberOfMonths);
    const [daySize, setDaySize] = React.useState(DAY_SIZE_DESKTOP);
    const [buttonSize, setButtonSize] = React.useState(BUTTON_SIZE_DESKTOP);
    const [isMobile, setIsMobile] = React.useState(false);


    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);

            setMonthsToShow(mobile ? 1 : baseNumberOfMonths);
            setDaySize(mobile ? DAY_SIZE_MOBILE : DAY_SIZE_DESKTOP);
            setButtonSize(mobile ? BUTTON_SIZE_MOBILE : BUTTON_SIZE_DESKTOP);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [baseNumberOfMonths]);


    const customStyles: React.CSSProperties = {
        '--rdp-day-width': daySize,
        '--rdp-day-height': daySize,
        '--rdp-day_button-width': buttonSize,
        '--rdp-day_button-height': buttonSize,

        '--rdp-selected-border': '2px solid transparent',
        '--rdp-accent-color': '#A78BFA',
        '--rdp-range_middle-background-color': 'rgba(124, 58, 237, 0.3)',
        '--rdp-range_start-date-background-color': '#8B5CF6',
        '--rdp-range_end-date-background-color': '#8B5CF6',

        '--rdp-weekday-text-align': 'center',
        '--rdp-weekday-padding': '0',
    }

    const customClassNames = {
        root: "rdp-root custom-calendar font-sans",
        months: cn("flex space-y-4 sm:space-y-0 sm:space-x-6", monthsToShow > 1 ? "overflow-x-auto" : "flex-col"),

        month: "w-full min-w-[180px] sm:min-w-0",

        caption: "flex items-center justify-between px-3 py-2 text-sm font-semibold text-purple-200",
        caption_label: "flex-1 text-center text-lg tracking-wide",
        nav: "flex items-center space-x-2",
        nav_button_previous: "text-purple-400 hover:text-purple-100 transition-colors duration-200",
        nav_button_next: "text-purple-400 hover:text-purple-100 transition-colors duration-200",
        table: "w-full border-collapse !table-fixed",
        head_row: "text-xs uppercase text-purple-400 font-medium w-full",

        head_cell: "text-center !p-0 sm:py-2 sm:px-2",

        row: "",
        day: "relative z-10 inline-flex items-center justify-center rounded-full text-sm font-medium transition-all hover:scale-[1.08] hover:bg-purple-700/30",
        day_outside: "opacity-40 text-purple-300",
        day_today: "font-bold text-teal-400 ring-1 ring-teal-400/50",
        day_disabled: "opacity-20 cursor-not-allowed text-purple-500",

        day_selected: "z-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-700 text-white shadow-lg shadow-indigo-500/30 scale-[1.08] rounded-full",
        day_range_start: "z-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-700 text-white shadow-lg shadow-indigo-500/30 scale-[1.08] rounded-l-full !rounded-r-none",
        day_range_end: "z-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-700 text-white shadow-lg shadow-indigo-500/30 scale-[1.08] rounded-r-full !rounded-l-none",
        day_range_middle: "z-10 text-purple-100 !rounded-none",

        ...classNames,
    }

    return (
        <div className={cn("w-full mx-auto p-1 sm:p-6", className)}>
            <div
                className={cn(
                    "relative rounded-[2rem] border border-purple-800/20 bg-gradient-to-br from-purple-950/40 to-indigo-900/30 backdrop-blur-3xl shadow-2xl shadow-purple-900/50",
                    "ring-1 ring-purple-700/30 transition-all duration-300",
                    "w-full overflow-hidden"
                )}
            >
                <DayPicker
                    mode="range"
                    selected={selected}
                    onSelect={onSelect}
                    numberOfMonths={monthsToShow}
                    showOutsideDays={showOutsideDays}
                    weekStartsOn={weekStartsOn}
                    disabled={disabledDates}
                    min={minRangeLength}
                    max={maxRangeLength}
                    pagedNavigation={monthsToShow > 1 ? true : false}
                    style={customStyles}
                    className={cn("p-4 sm:p-8 select-none !text-purple-50", className)}
                    classNames={customClassNames}
                    locale={uk}
                    formatters={{
                        formatWeekdayName: (date) =>
                            formatWeekdayName(date, { locale: uk }),
                    }}
                    components={{
                        IconLeft: () => <ChevronLeft className="h-5 w-5" />,
                        IconRight: () => <ChevronRight className="h-5 w-5" />,
                    }}
                    {...props}
                />
            </div>
        </div>
    )
}

Calendar.displayName = "Calendar"
export default Calendar