import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { Switch } from '../../../components/switch.tsx';
import { Textarea } from '../../../components/textarea';
import { Badge } from '../../../components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/avatar';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

import {
    useGetHackathonByIdQuery,
    useUpdateHackathonMutation,
    useGetThemeCategoriesQuery,
} from "../api/hackathonApi.ts";
import { useLazyLookupUserByEmailQuery, type UserLookupData } from "../../profile/api/userApi.ts";

import {
    Check, Code2, Edit, Eye, FileText, Mail, Plus, Star,
    UserPlus, Users, X, Calendar
} from 'lucide-react';
import {EditSectionHeader} from "../components/hackathon/EditSectionHeader.tsx";
import {EditHackathonPreview} from "../components/hackathon/EditHackathonPreview.tsx";
import {renderMarkdown} from "../../../shared/utils/utils.ts";

interface SelectedTheme { id: string; name: string; }
interface Judge { id: string; name: string; email: string; avatar?: string; }
interface EditableRatingCategory { id?: string; name: string; order: number; isNew?: boolean; }
interface HackathonPageProps { onNavigateBack?: () => void; }

const toDatetimeLocal = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

export function EditHackathonPage({ onNavigateBack }: HackathonPageProps) {
    const { id: hackathonId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: hackathonData,
        isLoading: isHackathonLoading,
        isError: isHackathonError,
        error: hackathonError,
        isSuccess
    } = useGetHackathonByIdQuery(hackathonId || '', { skip: !hackathonId });

    const [
        updateHackathon,
        { isLoading: isUpdating, isError: isUpdateError, error: updateErrorData }
    ] = useUpdateHackathonMutation();

    const { data: allThemes = [], isLoading: isThemesLoading } = useGetThemeCategoriesQuery();

    const [
        lookupUser,
        { data: foundUser, isFetching: isUserFetching, error: userLookupError }
    ] = useLazyLookupUserByEmailQuery();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedThemes, setSelectedThemes] = useState<SelectedTheme[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [ratingCategories, setRatingCategories] = useState<EditableRatingCategory[]>([]);
    const [allowParticipantRating, setAllowParticipantRating] = useState(false);
    const [allowPublicRating, setAllowPublicRating] = useState(false);
    const [newThemes, setNewThemes] = useState<string[]>([]);

    const [themeInput, setThemeInput] = useState('');
    const [newThemeInput, setNewThemeInput] = useState('');
    const [showThemeSuggestions, setShowThemeSuggestions] = useState(false);
    const [judgeEmail, setJudgeEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserLookupData | null>(null);
    const [isSearchingJudge, setIsSearchingJudge] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryOrder, setNewCategoryOrder] = useState(1);
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const [showDismissableError, setShowDismissableError] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        basics: true, dates: true, criteria: false, team: false, rules: false,
    });

    useEffect(() => {
        if (isSuccess && hackathonData) {
            setTitle(hackathonData.title || '');
            setDescription(hackathonData.description || '');
            setStartDate(toDatetimeLocal(hackathonData.startDate));
            setEndDate(toDatetimeLocal(hackathonData.endDate));
            setSelectedThemes(hackathonData.themes || []);
            setJudges(hackathonData.judges.map(j => ({
                id: j.id,
                name: j.username,
                email: j.email,
                avatar: j.avatarUrl
            })) || []);
            setRatingCategories(hackathonData.ratingCategories.map(c => ({
                id: c.id,
                name: c.name,
                order: c.order,
                isNew: false
            })) || []);
            setAllowParticipantRating(hackathonData.allowParticipantRating || false);
            setAllowPublicRating(hackathonData.allowPublicRating || false);
            setNewThemes([]);
        }
    }, [isSuccess, hackathonData]);

    useEffect(() => {
        if (isUserFetching) {
            setIsSearchingJudge(true);
        } else {
            setIsSearchingJudge(false);
            if (foundUser) {
                setSearchedUser(foundUser);
            } else if (userLookupError) {
                setSearchedUser(null);
            }
        }
    }, [isUserFetching, foundUser, userLookupError]);

    const toggleSection = (sectionId: string) => { setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] })); };
    const handleDismissError = () => { setShowDismissableError(false); };

    const handleAddTheme = (theme: SelectedTheme) => { if (!selectedThemes.find(t => t.id === theme.id)) { setSelectedThemes([...selectedThemes, theme]); setThemeInput(''); setShowThemeSuggestions(false); } };
    const handleRemoveTheme = (themeId: string) => { setSelectedThemes(selectedThemes.filter(t => t.id !== themeId)); };
    const handleThemeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setThemeInput(e.target.value); setShowThemeSuggestions(true); };
    const handleAddNewTheme = () => {
        const themeName = newThemeInput.trim();
        if (themeName && !newThemes.includes(themeName)) {
            setNewThemes([...newThemes, themeName]);
            setNewThemeInput('');
        }
    };
    const handleRemoveNewTheme = (themeName: string) => { setNewThemes(newThemes.filter(t => t !== themeName)); };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        setRatingCategories([...ratingCategories, {
            name: newCategoryName,
            order: newCategoryOrder,
            isNew: true,
        }]);
        setNewCategoryName('');
        setNewCategoryOrder(prev => prev + 1);
    };
    const handleRemoveCategory = (indexToRemove: number) => {
        setRatingCategories(ratingCategories.filter((_, index) => index !== indexToRemove));
    };
    const handleCategoryChange = (index: number, field: 'name' | 'order', value: string | number) => {
        const updatedCategories = [...ratingCategories];
        const category = updatedCategories[index];
        if (field === 'name' && typeof value === 'string') {
            category.name = value;
        } else if (field === 'order' && typeof value === 'number') {
            category.order = value;
        }
        setRatingCategories(updatedCategories);
    };

    const handleSearchJudge = () => {
        const email = judgeEmail.trim();
        if (email) {
            setIsSearchingJudge(true);
            setSearchedUser(null);
            lookupUser(email);
        }
    };
    const handleAddJudge = () => {
        if (searchedUser && !judges.find(c => c.id === searchedUser.id)) {
            setJudges(prev => [...prev, {
                id: searchedUser.id,
                name: searchedUser.name,
                email: searchedUser.email,
                avatar: searchedUser.avatarUrl
            }]);
            setSearchedUser(null);
            setJudgeEmail('');
        }
    };
    const handleRemoveJudge = (id: string) => { setJudges(judges.filter(c => c.id !== id)); };

    const filteredThemeSuggestions = useMemo(() => {
        const input = themeInput.toLowerCase();
        const unselected = allThemes.filter(theme => !selectedThemes.find(t => t.id === theme.id));
        const startsWith = unselected.filter(theme => theme.name.toLowerCase().startsWith(input));
        const contains = unselected.filter(theme => theme.name.toLowerCase().includes(input) && !theme.name.toLowerCase().startsWith(input));
        return [...startsWith, ...contains].slice(0, 5);
    }, [themeInput, allThemes, selectedThemes]);

    const hackathonUpdateData = useMemo(() => {
        const existingCategoryIds = ratingCategories
            .filter(c => c.id && !c.isNew)
            .map(c => c.id);
        const newCategoryData = ratingCategories
            .filter(c => c.isNew)
            .map(c => ({ name: c.name, order: c.order }));

        return {
            title,
            description,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            themeIds: selectedThemes.map(t => t.id),
            newThemes: newThemes,
            judgeIds: judges.map(j => j.id),
            ratingCategoryIds: existingCategoryIds as string[],
            newRatingCategories: newCategoryData,
            allowParticipantRating,
            allowPublicRating,
            themes: selectedThemes,
        };
    }, [title, description, startDate, endDate, selectedThemes, newThemes, judges, ratingCategories, allowParticipantRating, allowPublicRating]);

    const canSubmit = title.trim() !== '' && startDate && endDate;

    const handleSubmit = async () => {
        if (!canSubmit || !hackathonId) {
            alert("Будь ласка, заповніть назву та дати.");
            return;
        }
        try {
            await updateHackathon({
                id: hackathonId,
                body: hackathonUpdateData
            }).unwrap();
            navigate(`/hackathon/view/${hackathonId}`);
        } catch (err) {
            console.error("Помилка оновлення хакатону:", err);
            setShowDismissableError(true);
        }
    };


    if (isHackathonLoading) {
        return <Loading fullScreen text="Завантаження хакатону для редагування..." />;
    }
    if (isHackathonError || !hackathonData) {
        return (
            <ErrorMessage
                fullScreen
                title="Помилка завантаження"
                message={(hackathonError as any)?.data?.message || `Не вдалося завантажити хакатон.`}
                onDismiss={() => navigate(-1)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative ">

            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />

            <div className="absolute top-10 right-10 size-56 md:top-20 md:right-20 md:size-96 bg-primary/20 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-10 left-10 size-56 md:bottom-20 md:left-20 md:size-96 bg-cyan-500/10 rounded-full blur-3xl z-0" />
            <div className="absolute top-1/3 left-1/3 size-56 md:size-96 bg-pink-500/10 rounded-full blur-3xl z-0" />

            {(isUpdateError || showDismissableError) && (
                <ErrorMessage
                    fullScreen
                    title="Помилка оновлення"
                    message={(updateErrorData as any)?.data?.message || "Не вдалося оновити хакатон."}
                    onDismiss={handleDismissError}
                    onRetry={() => { handleDismissError(); handleSubmit(); }}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 py-24 pt-16 sm:pt-24 min-h-[calc(100vh-6rem)] relative z-10">

                <div className="sticky top-0 z-20 mb-8 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <Edit className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Редагування хакатону:</h1>
                            <p className="text-lg text-primary truncate max-w-xs sm:max-w-md">{title || 'Без назви'}</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isUpdating || !canSubmit}
                        className="rounded-xl flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 shadow-md shadow-green-500/30 disabled:opacity-60 w-full sm:w-auto justify-center"
                    >
                        {isUpdating ? <Loading className="size-4 animate-spin" /> : <Check className="size-4" />}
                        {isUpdating ? 'Оновлення...' : 'Зберегти зміни'}
                    </Button>
                </div>

                <div className="grid lg:grid-cols-[2fr_1fr] gap-8">

                    <div className="space-y-6">

                        <section className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <EditSectionHeader title="Основні параметри" icon={FileText} isOpen={openSections.basics} onClick={() => toggleSection('basics')} />
                            <motion.div initial={false} animate={{ height: openSections.basics ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    <div className="space-y-2"> <Label htmlFor="hackathonTitle">Назва хакатону *</Label> <Input id="hackathonTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Назва..." className="rounded-2xl bg-secondary/50 focus-visible:ring-primary" /> </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="description">Опис хакатону</Label>
                                            <Button type="button" variant="ghost" onClick={() => setShowMarkdownPreview(!showMarkdownPreview)} className="flex items-center gap-1 text-primary hover:text-primary/80 p-2 h-auto text-sm"> <Eye className="size-4" /> {showMarkdownPreview ? 'Редагувати' : 'Переглянути'} </Button>
                                        </div>
                                        {!showMarkdownPreview ? (
                                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="# Опис..." className="min-h-[250px] rounded-2xl bg-secondary/50 font-mono focus-visible:ring-primary" />
                                        ) : (
                                            <div className="min-h-[250px] rounded-2xl bg-secondary/50 p-4 prose prose-invert max-w-none border border-primary/30 shadow-inner" dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        <section className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <EditSectionHeader title="Дати проведення" icon={Calendar} isOpen={openSections.dates} onClick={() => toggleSection('dates')} />
                            <motion.div initial={false} animate={{ height: openSections.dates ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2"> <Label htmlFor="startDate">Дата початку *</Label> <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-2xl bg-secondary/50 focus-visible:ring-primary" /> </div>
                                    <div className="space-y-2"> <Label htmlFor="endDate">Дата завершення *</Label> <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-2xl bg-secondary/50 focus-visible:ring-primary" /> </div>
                                </div>
                            </motion.div>
                        </section>

                        <section className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <EditSectionHeader title="Теми та Критерії" icon={Code2} isOpen={openSections.criteria} onClick={() => toggleSection('criteria')} />
                            <motion.div initial={false} animate={{ height: openSections.criteria ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-8">

                                    <div className="space-y-3">
                                        <Label htmlFor="themeInput">Теми (виберіть існуючі)</Label>
                                        <div className="relative">
                                            <Input id="themeInput" placeholder="Fintech, AI, Web3..." value={themeInput} onChange={handleThemeInputChange} onFocus={() => setShowThemeSuggestions(true)} onBlur={() => setTimeout(() => setShowThemeSuggestions(false), 200)} disabled={isThemesLoading} className="rounded-2xl bg-secondary/50 focus-visible:ring-primary" />
                                            {showThemeSuggestions && themeInput.trim() && filteredThemeSuggestions.length > 0 && (
                                                <div className="absolute z-20 w-full mt-1 bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                    {filteredThemeSuggestions.map((theme) => ( <button key={theme.id} type="button" onClick={() => handleAddTheme(theme)} className="w-full text-left p-3 hover:bg-secondary/50 transition-colors"> {theme.name} </button> ))}
                                                </div>
                                            )}
                                            {isThemesLoading && <Loading className="absolute right-3 top-1/2 -translate-y-1/2 size-4" />}
                                        </div>
                                        {selectedThemes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {selectedThemes.map((theme) => (
                                                    <Badge key={theme.id} className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 pl-3 pr-2 py-1.5 gap-2 text-primary hover:scale-[1.02] transition-transform">
                                                        {theme.name}
                                                        <button type="button" onClick={() => handleRemoveTheme(theme.id)} className="p-0.5 rounded-full hover:bg-white/20">
                                                            <X className="size-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="newThemeInput">Додати нову тему (якщо немає в списку)</Label>
                                        <div className="flex gap-2">
                                            <Input id="newThemeInput" placeholder="Наприклад: 'Green Energy'" value={newThemeInput} onChange={e => setNewThemeInput(e.target.value)} className="rounded-2xl bg-secondary/50 focus-visible:ring-cyan-500" />
                                            <Button type="button" variant="secondary" onClick={handleAddNewTheme} className="rounded-xl bg-cyan-500/90 hover:bg-cyan-600/90 flex-shrink-0"><Plus className="size-4" /></Button>
                                        </div>
                                        {newThemes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {newThemes.map((themeName) => (
                                                    <Badge key={themeName} className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 pl-3 pr-2 py-1.5 gap-2 text-cyan-400 hover:scale-[1.02] transition-transform">
                                                        {themeName}
                                                        <button type="button" onClick={() => handleRemoveNewTheme(themeName)} className="p-0.5 rounded-full hover:bg-white/20">
                                                            <X className="size-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="font-semibold">Критерії Оцінювання ({ratingCategories.length})</Label>
                                        <div className="space-y-2">
                                            {ratingCategories.sort((a,b) => a.order - b.order).map((cat, index) => (
                                                <div key={cat.id || `new-${index}`} className={`flex gap-2 items-center p-2 rounded-xl transition-all ${cat.isNew ? 'bg-indigo-500/10' : 'bg-secondary/20'}`}>
                                                    <Input
                                                        placeholder="Назва критерію (н-д, Дизайн)"
                                                        value={cat.name}
                                                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                                                        className="rounded-xl bg-secondary/50 focus-visible:ring-indigo-500"
                                                    />
                                                    <Input
                                                        type="number"
                                                        value={cat.order}
                                                        onChange={(e) => handleCategoryChange(index, 'order', parseInt(e.target.value) || 0)}
                                                        className="rounded-xl bg-secondary/50 w-20 text-center focus-visible:ring-indigo-500"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveCategory(index)}
                                                        className="rounded-xl hover:bg-destructive/20 hover:text-destructive p-2"
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 p-3 bg-secondary/30 rounded-2xl border border-border/50">
                                            <Input placeholder="Нова назва критерію" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="rounded-xl bg-background/50 focus-visible:ring-primary" />
                                            <Input type="number" placeholder="Порядок" value={newCategoryOrder} onChange={(e) => setNewCategoryOrder(parseInt(e.target.value) || 1)} className="rounded-xl bg-background/50 w-24 text-center focus-visible:ring-primary" />
                                            <Button type="button" variant="secondary" onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="rounded-xl bg-primary/90 hover:bg-primary flex-shrink-0 gap-1"> <Plus className="size-4" /> Додати </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        <section className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <EditSectionHeader title="Команда (Судді)" icon={Users} isOpen={openSections.team} onClick={() => toggleSection('team')} />
                            <motion.div initial={false} animate={{ height: openSections.team ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="judgeEmail">Email судді</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input
                                                    id="judgeEmail"
                                                    placeholder="email@example.com"
                                                    value={judgeEmail}
                                                    onChange={(e) => setJudgeEmail(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchJudge())}
                                                    disabled={isSearchingJudge}
                                                    className="rounded-2xl bg-secondary/50 pl-10 focus-visible:ring-primary"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleSearchJudge}
                                                disabled={isSearchingJudge || !judgeEmail.trim()}
                                                className="flex rounded-xl items-center justify-center hover:scale-105 bg-primary/90 hover:bg-primary gap-2 w-28 flex-shrink-0"
                                            >
                                                {isSearchingJudge ? <Loading className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                                                {isSearchingJudge ? 'Пошук...' : 'Знайти'}
                                            </Button>
                                        </div>
                                        <div className="min-h-[70px] pt-2">
                                            {searchedUser && (
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-secondary/50 rounded-2xl border border-primary/30 shadow-md gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={searchedUser.avatarUrl} alt={searchedUser.name} />
                                                            <AvatarFallback>{searchedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">{searchedUser.name}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{searchedUser.email}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddJudge}
                                                        disabled={judges.some(c => c.id === searchedUser.id)}
                                                        className="rounded-xl flex-shrink-0 bg-green-500/90 hover:bg-green-600/90 gap-1 w-full sm:w-auto justify-center"
                                                    >
                                                        {judges.some(c => c.id === searchedUser.id) ?
                                                            <><Check className="size-4" /> Додано</> :
                                                            <><Plus className="size-4" /> Додати</>
                                                        }
                                                    </Button>
                                                </div>
                                            )}
                                            {!isSearchingJudge && userLookupError && judgeEmail.trim() && ( <p className="text-sm text-destructive mt-2">Користувача з такою поштою не знайдено.</p> )}
                                        </div>
                                    </div>

                                    {judges.length > 0 && (
                                        <div className="space-y-3">
                                            <Label>Призначені судді ({judges.length})</Label>
                                            <div className="space-y-2">
                                                {judges.map((judge) => (
                                                    <div key={judge.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border/50 transition-shadow hover:shadow-lg">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={judge.avatar} alt={judge.name} />
                                                            <AvatarFallback> {judge.name?.charAt(0)?.toUpperCase() || 'U'} </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate font-medium">{judge.name}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{judge.email}</p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveJudge(judge.id)}
                                                            className="rounded-xl hover:bg-destructive/20 hover:text-destructive flex-shrink-0 p-2 h-auto"
                                                        >
                                                            <X className="size-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </section>

                        <section className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <EditSectionHeader title="Правила Оцінювання" icon={Star} isOpen={openSections.rules} onClick={() => toggleSection('rules')} />
                            <motion.div initial={false} animate={{ height: openSections.rules ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="allowParticipantRating" className="font-semibold">Дозволити учасникам оцінювати</Label>
                                            <p className="text-sm text-muted-foreground">Дозволяє учасникам ставити оцінки проектам, окрім своїх.</p>
                                        </div>
                                        <Switch id="allowParticipantRating" checked={allowParticipantRating} onCheckedChange={setAllowParticipantRating} className="flex-shrink-0" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="allowPublicRating" className="font-semibold">Дозволити глядачам оцінювати</Label>
                                            <p className="text-sm text-muted-foreground">Дозволяє будь-яким авторизованим користувачам (не суддям/учасникам) ставити оцінки.</p>
                                        </div>
                                        <Switch id="allowPublicRating" checked={allowPublicRating} onCheckedChange={setAllowPublicRating} className="flex-shrink-0" />
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        <div className="pb-8 pt-4 lg:hidden">
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isUpdating || !canSubmit}
                                className="rounded-xl flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 shadow-lg shadow-green-500/30 disabled:opacity-60 w-full justify-center text-lg"
                            >
                                {isUpdating ? <Loading className="size-5 animate-spin" /> : <Check className="size-5" />}
                                {isUpdating ? 'Оновлення...' : 'Зберегти зміни'}
                            </Button>
                        </div>
                    </div>

                    <div className="lg:block hidden sticky top-28 h-fit">
                        <EditHackathonPreview
                            data={hackathonUpdateData}
                            renderMarkdown={renderMarkdown}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default EditHackathonPage;