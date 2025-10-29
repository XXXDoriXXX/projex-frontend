import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type {Judge, NewRatingCategory, HackathonStep} from "../types/hackathonTypes";
import {
    useGetThemeCategoriesQuery,
    useGetRatingCategoriesQuery,
    type HackathonThemeCategory, type HackathonRatingCategory
} from "../api/hackathonApi.ts";
import { type DateRange } from "react-day-picker";
// 1. Визначаємо, що буде зберігати наш Context
interface CreateHackathonContextType {
    // Стан DTO
    title: string;
    currentStep: HackathonStep;
    setCurrentStep: React.Dispatch<React.SetStateAction<HackathonStep>>;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    dateRange: DateRange | undefined;
    setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
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

    // Обробники (перенесемо їх сюди)
    handleToggleTheme: (themeId: string) => void;
    handleAddNewTheme: () => void;
    handleRemoveNewTheme: (themeName: string) => void;
    handleToggleCategory: (catId: string) => void;
    handleAddNewCategory: () => void;
    handleRemoveNewCategory: (catName: string) => void;

    // Фінальні дані для відправки
    hackathonData: Record<string, any>;
    allThemes: HackathonThemeCategory[];
    isThemesLoading: boolean;
    allRatingCategories: HackathonRatingCategory[];
    isCriteriaLoading: boolean;

}

// 2. Створюємо Context
const CreateHackathonContext = createContext<CreateHackathonContextType | undefined>(undefined);

// 3. Створюємо Провайдер (компонент-обгортку)
export function CreateHackathonProvider({ children }: { children: ReactNode }) {

    const { data: allThemes = [], isLoading: isThemesLoading } = useGetThemeCategoriesQuery();
    const { data: allRatingCategories = [], isLoading: isCriteriaLoading } = useGetRatingCategoriesQuery();
    // === ПЕРЕНОСИМО ВСІ useSTATE З CreateHackathonPage СЮДИ ===
    const [title, setTitle] = useState('');
    const [currentStep, setCurrentStep] = useState<HackathonStep>('basics');
    const [description, setDescription] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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

    const handleRemoveJudge = (id: string) => {
        setJudgeIds(judgeIds.filter(c => c.id !== id));
    };

    // === ПЕРЕНОСИМО useMemo З ДАНИМИ СЮДИ ===
    const hackathonData = useMemo(() => {
        return {
            title, description,
            startDate: dateRange?.from?.toISOString(),
            endDate: dateRange?.to?.toISOString(),
            themeIds, ratingCategoryIds,
            judgeIds: judgeIds.map(j => j.id),
            newThemes, newRatingCategories,
            allowParticipantRating, allowPublicRating,
        };
    }, [
        title, description, dateRange, themeIds,
        ratingCategoryIds, judgeIds, newThemes, newRatingCategories,
        allowParticipantRating, allowPublicRating
    ]);

    // 4. Збираємо все, що хочемо "провайдити"
    const value = {
        title, setTitle,
        currentStep, setCurrentStep,
        description, setDescription,
        dateRange, setDateRange,
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
        isSearchingJudge, setIsSearchingJudge,
        judgeSearchError, setJudgeSearchError,

        handleToggleTheme,
        handleAddNewTheme,
        handleRemoveNewTheme,
        handleToggleCategory,
        handleAddNewCategory,
        handleRemoveNewCategory,
        handleRemoveJudge,
        allThemes,
        isThemesLoading,
        allRatingCategories,
        isCriteriaLoading,
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