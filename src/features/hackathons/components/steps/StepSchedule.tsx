import {Calendar as CalendarIcon, CalendarDays} from "lucide-react";
import {Label} from "../../../../components/label.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "../../../../components/popover.tsx";
import Button from "../../../../components/Button.tsx";
import {format} from "date-fns";
import {Calendar} from "../../../../components/calendar.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React from "react";
import {useCreateHackathon} from "../../hooks/useCreateHackathonContext.tsx";

export function StepSchedule(){
    const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isStartDatePickerOpen,
    setIsStartDatePickerOpen,
    isEndDatePickerOpen,
    setIsEndDatePickerOpen,

    } = useCreateHackathon();

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

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker: Start Date */}
        <div className="space-y-2">
            <Label htmlFor="startDate">Дата початку *</Label>
            <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"ghost"}
                        className="w-full justify-start text-left font-normal rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 hover:bg-secondary/70 h-11"
                    >
                        <CalendarIcon className="mr-2 size-4" />
                        {startDate ? format(startDate, "PPP") : <span>Оберіть дату</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                            setStartDate(date);
                            setIsStartDatePickerOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>

        {/* Date Picker: End Date */}
        <div className="space-y-2">
            <Label htmlFor="endDate">Дата завершення *</Label>
            <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"ghost"}
                        className="w-full justify-start text-left font-normal rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 hover:bg-secondary/70 h-11"
                    >
                        <CalendarIcon className="mr-2 size-4" />
                        {endDate ? format(endDate, "PPP") : <span>Оберіть дату</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                            setEndDate(date);
                            setIsEndDatePickerOpen(false);
                        }}
                        disabled={(date) =>
                            startDate ? date < startDate : false
                        }

                    />
                </PopoverContent>
            </Popover>
        </div>
    </div>
</div>)
}