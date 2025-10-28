import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type {Judge, NewRatingCategory, JudgeLookupData, HackathonStep} from "../types/hackathonTypes";
import {allRatingCategories} from "../components/steps/StepCriteria.tsx"; // (Припустимо, ти винесеш типи)

// 1. Визначаємо, що буде зберігати наш Context
interface CreateHackathonContextType {
    // Стан DTO
    title: string;
    currentStep: HackathonStep;
    setCurrentStep: React.Dispatch<React.SetStateAction<HackathonStep>>;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    startDate: Date | undefined;
    setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    endDate: Date | undefined;
    setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    isStartDatePickerOpen: boolean;
    setIsStartDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isEndDatePickerOpen: boolean;
    setIsEndDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    themeIds: string[];
    setThemeIds: React.Dispatch<React.SetStateAction<string[]>>;
    ratingCategoryIds: string[];
    setRatingCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
    judgeIds: Judge[]; // Використовуємо повний об'єкт Judge для UI
    setJudgeIds: React.Dispatch<React.SetStateAction<Judge[]>>;
    newThemes: string[];
    setNewThemes: React.Dispatch<React.SetStateAction<string[]>>;
    newRatingCategories: NewRatingCategory[];
    setNewRatingCategories: React.Dispatch<React.SetStateAction<NewRatingCategory[]>>;
    allowParticipantRating: boolean;
    setAllowParticipantRating: React.Dispatch<React.SetStateAction<boolean>>;
    allowPublicRating: boolean;
    setAllowPublicRating: React.Dispatch<React.SetStateAction<boolean>>;

    // Допоміжний стан UI
    showMarkdownPreview: boolean;
    setShowMarkdownPreview: React.Dispatch<React.SetStateAction<boolean>>;
    newThemeInput: string;
    setNewThemeInput: React.Dispatch<React.SetStateAction<string>>;
    newCategoryInput: string;
    setNewCategoryInput: React.Dispatch<React.SetStateAction<string>>;
    judgeEmail: string;
    setJudgeEmail: React.Dispatch<React.SetStateAction<string>>;
    searchedJudge: JudgeLookupData | null;
    setSearchedJudge: React.Dispatch<React.SetStateAction<JudgeLookupData | null>>;
    isSearchingJudge: boolean;
    setIsSearchingJudge: React.Dispatch<React.SetStateAction<boolean>>;
    judgeSearchError: boolean;
    setJudgeSearchError: React.Dispatch<React.SetStateAction<boolean>>;

    // Обробники (перенесемо їх сюди)
    handleToggleTheme: (themeId: string) => void;
    handleAddNewTheme: () => void;
    handleRemoveNewTheme: (themeName: string) => void;
    handleToggleCategory: (catId: string) => void;
    handleAddNewCategory: () => void;
    handleRemoveNewCategory: (catName: string) => void;
    handleSearchJudge: () => void; // (або залиш у компоненті, якщо він використовує RTK Query)
    handleAddJudge: () => void;
    handleRemoveJudge: (id: string) => void;

    // Фінальні дані для відправки
    hackathonData: Record<string, any>;
}

// 2. Створюємо Context
const CreateHackathonContext = createContext<CreateHackathonContextType | undefined>(undefined);

// 3. Створюємо Провайдер (компонент-обгортку)
export function CreateHackathonProvider({ children }: { children: ReactNode }) {
    // === ПЕРЕНОСИМО ВСІ useSTATE З CreateHackathonPage СЮДИ ===
    const [title, setTitle] = useState('');
    const [currentStep, setCurrentStep] = useState<HackathonStep>('basics');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
    const [themeIds, setThemeIds] = useState<string[]>([]);
    const [ratingCategoryIds, setRatingCategoryIds] = useState<string[]>([]);
    const [judgeIds, setJudgeIds] = useState<Judge[]>([]);
    const [newThemes, setNewThemes] = useState<string[]>([]);
    const [newRatingCategories, setNewRatingCategories] = useState<NewRatingCategory[]>([]);
    const [allowParticipantRating, setAllowParticipantRating] = useState(false);
    const [allowPublicRating, setAllowPublicRating] = useState(false);
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const [newThemeInput, setNewThemeInput] = useState('');
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [judgeEmail, setJudgeEmail] = useState('');
    const [searchedJudge, setSearchedJudge] = useState<JudgeLookupData | null>(null);
    const [isSearchingJudge, setIsSearchingJudge] = useState(false);
    const [judgeSearchError, setJudgeSearchError] = useState(false);



    // === ПЕРЕНОСИМО ВСІ ОБРОБНИКИ СЮДИ ===
    // (Я покажу приклад для тем, решта - аналогічно)

    const handleToggleTheme = (themeId: string) => {
        setThemeIds(prev =>
            prev.includes(themeId) ? prev.filter(id => id !== themeId) : [...prev, themeId]
        );
    };
    const handleAddNewTheme = () => {
        const themeName = newThemeInput.trim();
        if (themeName && !newThemes.includes(themeName)) {
            setNewThemes([...newThemes, themeName]);
            setNewThemeInput('');
        }
    };

    const handleRemoveNewTheme = (themeName: string) => {
        setNewThemes(newThemes.filter(t => t !== themeName));
    };

    // Крок 4: Критерії
    const handleToggleCategory = (catId: string) => {
        setRatingCategoryIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };
    const handleAddNewCategory = () => {
        const catName = newCategoryInput.trim();
        if (catName && !newRatingCategories.find(c => c.name === catName)) {
            const newCategory: NewRatingCategory = {
                name: catName,
                order: (allRatingCategories.length + newRatingCategories.length) + 1
            };
            setNewRatingCategories([...newRatingCategories, newCategory]);
            setNewCategoryInput('');
        }
    };
    const handleRemoveNewCategory = (catName: string) => {
        setNewRatingCategories(newRatingCategories.filter(c => c.name !== catName));
    };

    // Крок 5: Судді (Заглушка API)
    const handleSearchJudge = () => {
        const email = judgeEmail.trim();
        if (!email) return;

        setIsSearchingJudge(true);
        setSearchedJudge(null);
        setJudgeSearchError(false);

        // Імітація запиту до API
        setTimeout(() => {
            if (email === "judge@example.com") {
                setSearchedJudge({
                    id: 'user-judge-123',
                    name: 'Олена Петренко',
                    email: 'judge@example.com',
                    avatarUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Elena'
                });
            } else if (email === "exists@example.com") {
                setSearchedJudge({
                    id: 'user-judge-999',
                    name: 'Ігор Cікорський',
                    email: 'exists@example.com',
                    avatarUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Igor'
                });
                // Імітуємо, що він вже доданий
                setJudgeIds([{ id: 'user-judge-999', name: 'Ігор Cікорський', email: 'exists@example.com' }]);
            }
            else {
                setJudgeSearchError(true);
            }
            setIsSearchingJudge(false);
        }, 1000);
    };

    const handleAddJudge = () => {
        if (searchedJudge && !judgeIds.find(j => j.id === searchedJudge.id)) {
            const newJudge: Judge = {
                id: searchedJudge.id,
                name: searchedJudge.name,
                email: searchedJudge.email,
                avatar: searchedJudge.avatarUrl,
            };
            setJudgeIds([...judgeIds, newJudge]);
            setJudgeEmail('');
            setSearchedJudge(null);
        }
    };
    const handleRemoveJudge = (id: string) => {
        setJudgeIds(judgeIds.filter(c => c.id !== id));
    };

    // === ПЕРЕНОСИМО useMemo З ДАНИМИ СЮДИ ===
    const hackathonData = useMemo(() => {
        return {
            title, description,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            themeIds, ratingCategoryIds,
            judgeIds: judgeIds.map(j => j.id),
            newThemes, newRatingCategories,
            allowParticipantRating, allowPublicRating,
        };
    }, [
        title, description, startDate, endDate, themeIds,
        ratingCategoryIds, judgeIds, newThemes, newRatingCategories,
        allowParticipantRating, allowPublicRating
    ]);

    // 4. Збираємо все, що хочемо "провайдити"
    const value = {
        title, setTitle,
        currentStep, setCurrentStep,
        description, setDescription,
        startDate, setStartDate,
        endDate, setEndDate,
        isStartDatePickerOpen, setIsStartDatePickerOpen,
        isEndDatePickerOpen, setIsEndDatePickerOpen,
        themeIds, setThemeIds,
        ratingCategoryIds, setRatingCategoryIds,
        judgeIds, setJudgeIds,
        newThemes, setNewThemes,
        newRatingCategories, setNewRatingCategories,
        allowParticipantRating, setAllowParticipantRating,
        allowPublicRating, setAllowPublicRating,
        showMarkdownPreview, setShowMarkdownPreview,
        newThemeInput, setNewThemeInput,
        newCategoryInput, setNewCategoryInput,
        judgeEmail, setJudgeEmail,
        searchedJudge, setSearchedJudge,
        isSearchingJudge, setIsSearchingJudge,
        judgeSearchError, setJudgeSearchError,

        handleToggleTheme,
        handleAddNewTheme,
        handleRemoveNewTheme,
        handleToggleCategory,
        handleAddNewCategory,
        handleRemoveNewCategory,
        handleSearchJudge,
        handleAddJudge,
        handleRemoveJudge,

        hackathonData
    };

    return <CreateHackathonContext.Provider value={value}>{children}</CreateHackathonContext.Provider>;
}

// 5. Створюємо кастомний Хук для зручного доступу
// eslint-disable-next-line react-refresh/only-export-components
export function useCreateHackathon() {
    const context = useContext(CreateHackathonContext);
    if (context === undefined) {
        throw new Error("useCreateHackathon must be used within a CreateHackathonProvider");
    }
    return context;
}