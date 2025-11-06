import React, {useState, useEffect} from "react";
import Button from "../../../components/Button.tsx";

import { Progress } from "../../../components/Progress.tsx";
import {Badge} from "../../../components/badge.tsx";

import {
    ArrowLeft,
    Check,
    ChevronRight,
    FileText,
    Rocket,
    Users,
    Trophy,
    Hash,
    ClipboardCheck,
    Settings,
    CalendarDays
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import type {RootState} from "../../../store.ts";


import {CreateHackathonProvider, useCreateHackathon} from "../hooks/useCreateHackathonContext.tsx";
import { StepBasics } from "../components/steps/StepBasics.tsx";
import {StepSchedule} from "../components/steps/StepSchedule.tsx";
import {StepThemes} from "../components/steps/StepThemes.tsx";
import {StepSettings} from "../components/steps/StepSettings.tsx";
import {StepReview} from "../components/steps/StepReview.tsx";
import {StepCriteria} from "../components/steps/StepCriteria.tsx";
import {StepJudges} from "../components/steps/StepJudges.tsx";
import {useCreateHackathonMutation} from "../api/hackathonApi.ts";
import ErrorMessage from "../../../components/ErrorMessage.tsx";

type HackathonStep = 'basics' | 'schedule' | 'themes' | 'criteria' | 'judges' | 'settings' | 'review';

const steps = [
    { id: 'basics' as HackathonStep, title: 'Основна інформація', icon: FileText, description: 'Назва та опис' },
    { id: 'schedule' as HackathonStep, title: 'Дати проведення', icon: CalendarDays, description: 'Початок та кінець' },
    { id: 'themes' as HackathonStep, title: 'Тематика', icon: Hash, description: 'Оберіть теми' },
    { id: 'criteria' as HackathonStep, title: 'Критерії оцінювання', icon: ClipboardCheck, description: 'Як будуть оцінюватись проекти' },
    { id: 'judges' as HackathonStep, title: 'Судді', icon: Users, description: 'Додайте суддівську колегію' },
    { id: 'settings' as HackathonStep, title: 'Налаштування', icon: Settings, description: 'Правила оцінювання' },
    { id: 'review' as HackathonStep, title: 'Перегляд', icon: Rocket, description: 'Публікація' }
];

const stepComponents: Record<HackathonStep, React.ElementType> = {
    'basics': StepBasics,
    'schedule': StepSchedule,
    'themes': StepThemes,
    'criteria': StepCriteria,
    'judges': StepJudges,
    'settings': StepSettings,
    'review': StepReview,
};


function CreateHackathonLayout() {
    const navigate = useNavigate();
    const { hackathonData, currentStep, setCurrentStep } = useCreateHackathon();
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;



    const canProceed = () => {
        const data = hackathonData;
        switch (currentStep) {
            case 'basics':
                return data.title.trim() !== '' && data.description.trim() !== '';
            case 'schedule':
                return data.startDate && data.endDate && new Date(data.endDate) > new Date(data.startDate);
            case 'themes':
                return data.themeIds.length > 0 || data.newThemes.length > 0;
            case 'criteria':
                return data.ratingCategoryIds.length > 0 || data.newRatingCategories.length > 0;
            default:
                return true;
        }
    };

    const handleNextStep = () => {
        if (!canProceed()) return;
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1].id);
        }
    };

    const handlePrevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1].id);
        }
    };

    const isStepCompleted = (stepId: HackathonStep) => {
        return steps.findIndex(s => s.id === stepId) < currentStepIndex;
    };


    const [
        createHackathon,
        { isLoading: isSubmitting, isError: submitError, error: submitErrorData }
    ] = useCreateHackathonMutation();
    const handleSubmit = async () => {
        try {
            console.log("Submitting Hackathon Data:", hackathonData);
            const result = await createHackathon(hackathonData).unwrap();

            alert("Хакатон успішно створено!");
            navigate(`/hackathon/view/${result.data.id}`);

        } catch (err) {
            console.error("Failed to create hackathon:", err);
        }
    }
    const CurrentStepComponent = stepComponents[currentStep];

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />

            <div className="absolute top-10 right-10 size-56 md:top-20 md:right-20 md:size-96 bg-primary/20 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-10 left-10 size-56 md:bottom-20 md:left-20 md:size-96 bg-cyan-500/10 rounded-full blur-3xl z-0" />
            <div className="absolute top-1/3 left-1/3 size-56 md:size-96 bg-pink-500/10 rounded-full blur-3xl z-0" />


            <div className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">


                    <div className="flex items-center gap-3">
                        <Button
                            variant="glass"
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 md:px-4 md:py-3"
                        >
                            <ArrowLeft className="size-5" />
                            <span className="hidden md:inline">Вернутись</span>
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="size-9 sm:size-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                                <Trophy className="size-5 sm:size-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xs sm:text-sm">Створення хакатону</h2>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    Крок {currentStepIndex + 1} з {steps.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end sm:items-center gap-1 sm:gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5">
                            {Math.round(progress)}% завершено
                        </Badge>
                        <Progress value={progress} className="h-1.5 sm:h-2 w-32 sm:w-48" />
                    </div>
                </div>
            </div>


            <div className="relative min-h-screen px-4 py-24 pt-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-[300px_1fr] gap-8">


                        <div className="hidden lg:block">
                            <div className="sticky top-32 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-6 shadow-2xl">
                                <h3 className="mb-6">Прогрес створення</h3>
                                <div className="space-y-4">
                                    {steps.map((step) => {
                                        const isActive = step.id === currentStep;
                                        const isCompleted = isStepCompleted(step.id);
                                        const StepIcon = step.icon;
                                        return (
                                            <button
                                                key={step.id}
                                                onClick={() => setCurrentStep(step.id)}
                                                className={`w-full text-left transition-all ${
                                                    isActive ? 'scale-105' : 'hover:scale-102'
                                                }`}
                                            >
                                                <div className={`flex items-start gap-3 p-3 rounded-2xl transition-all ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-primary/20 to-purple-600/20 border-2 border-primary/50 shadow-lg shadow-primary/20'
                                                        : isCompleted
                                                            ? 'bg-secondary/50 border border-border/50'
                                                            : 'bg-secondary/30 border border-border/30'
                                                }`}>
                                                    <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                        isActive
                                                            ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30'
                                                            : isCompleted
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-secondary text-muted-foreground'
                                                    }`}>
                                                        {isCompleted ? (
                                                            <Check className="size-5" />
                                                        ) : (
                                                            <StepIcon className="size-5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`mb-0.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {step.title}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <ChevronRight className="size-4 text-primary flex-shrink-0 mt-2" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Indicator (ЗАПОВНЕНО) */}
                        <div className="lg:hidden mb-6">
                            <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {steps.map((step) => {
                                        const isActive = step.id === currentStep;
                                        const isCompleted = isStepCompleted(step.id);
                                        return (
                                            <div
                                                key={step.id}
                                                className={`flex-1 h-2 rounded-full transition-all ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-primary to-purple-600'
                                                        : isCompleted
                                                            ? 'bg-primary/50'
                                                            : 'bg-secondary'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Поточний крок</p>
                                        <p>{steps[currentStepIndex].title}</p>
                                    </div>
                                    <Badge variant="outline" className="border-primary/30">
                                        {currentStepIndex + 1}/{steps.length}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl min-h-[600px] flex flex-col">
                            {submitError && (
                                <ErrorMessage
                                    fullScreen
                                    title="Помилка публікації"
                                    message={(submitErrorData as any)?.data?.message || "Не вдалося створити хакатон."}
                                    onDismiss={()=>{} }
                                    onRetry={handleSubmit}
                                />
                            )}
                            <div className="flex-1">
                                <CurrentStepComponent />
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 mt-6 border-t border-border/50 gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handlePrevStep}
                                    disabled={currentStepIndex === 0 || isSubmitting}
                                    className="rounded-xl flex w-full sm:w-auto justify-center sm:gap-8 py-4 bg-secondary/50 border-border/50 hover:bg-secondary/70 disabled:opacity-50"
                                >
                                    <ArrowLeft className="size-6 mr-2" />
                                    Назад
                                </Button>

                                {currentStep === 'review' ? (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="rounded-xl w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/30 gap-2"
                                    >
                                        <Rocket className="size-4" />
                                        {isSubmitting ? "Публікація..." : "Опублікувати хакатон"}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={!canProceed()}
                                        className="rounded-xl w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        Далі
                                        <ChevronRight className="size-6 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function CreateHackathonPage() {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    const navigate = useNavigate();

    useEffect(() => {
        if(!currentUserId){
            //navigate("/")
        }
    }, [currentUserId, navigate]);

    return (
        <CreateHackathonProvider>
            <CreateHackathonLayout />
        </CreateHackathonProvider>
    );
}

export default CreateHackathonPage;