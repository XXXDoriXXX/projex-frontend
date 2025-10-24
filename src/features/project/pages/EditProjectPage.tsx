// src/features/project/pages/EditProjectPage.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import Button from '../../../components/Button';
import { Input } from '../../../components/input';
import { Label } from '../../../components/label';
import { RadioGroup, RadioGroupItem } from '../../../components/radio-group';
import { Progress } from '../../../components/Progress';
import { Textarea } from '../../../components/textarea';
import { Badge } from '../../../components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/avatar';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { Separator } from '../../../components/separator.tsx';
import ProjectPreview from '../../../components/ProjectPreview';

// --- Icon Imports ---
import {
    ArrowLeft, Check, ChevronRight, Code2, Edit, Eye, FileText, Github, Globe,
    ImageIcon, LinkIcon, Lock, Mail, Plus, Star, Upload,
    UserPlus, Users, Video, X
} from 'lucide-react';
import {useGetProjectDetailsQuery, useGetTechnologiesQuery,} from "../api/projectApi.ts";
import {useLazyLookupUserByEmailQuery} from "../../profile/api/userApi.ts";

// --- [TYPE DEFINITIONS & PLACEHOLDERS] ---
interface MediaFile { id: string; url: string; type: 'image' | 'video'; name: string; isMain: boolean; serverId?: string; uploadProgress: number; isUploading: boolean; uploadError: boolean; }
interface Collaborator { id: string; name: string; email: string; avatar?: string; }
interface SelectedTechnology { id: string; name: string; }
interface UserLookupData { id: string; email: string; name: string; avatarUrl: string; }
interface RootState { auth: { user?: { id?: string }, token?: string } }
interface CreateProjectPageProps { onNavigateBack?: () => void; }

// --- Placeholder Data ---

const uploadMediaToServer = async (file: File, token: string, onProgress: (p: number) => void): Promise<{ id: string, url: string, type: 'image' | 'video' }> => { /* ... */ return new Promise(resolve => setTimeout(() => resolve({ id: `server-${Date.now()}`, url: URL.createObjectURL(file), type: file.type.startsWith('image') ? 'image' : 'video' }), 500)); };


// [NEW] Helper component for Section Header with Toggle
const SectionHeader = ({ title, icon: Icon, isOpen, onClick }: { title: string, icon: any, isOpen: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full text-left flex items-center justify-between py-4 border-b border-border/50 hover:bg-secondary/20 -mx-4 px-4 transition-colors"
    >
        <div className="flex items-center gap-3">
            <Icon className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <ChevronRight className={`size-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
    </button>
);


export function EditProjectPage({ onNavigateBack }: CreateProjectPageProps) {
    const { projectId } = useParams<{ projectId: string }>();

    const navigate = useNavigate();
    const {
        data: projectData,
        isLoading: isProjectLoading, // Новий стан завантаження
        isError: isProjectError,     // Новий стан помилки
        error: projectError,
        isSuccess
    } = useGetProjectDetailsQuery(projectId || '', {
        skip: !projectId, // Пропускаємо запит, якщо projectId відсутній
    });
    // Використовуємо окрему змінну для isTechLoading з хука
    const { data: allTechnologies = [], isLoading: isTechsLoading } = useGetTechnologiesQuery();

    // --- State Initialization ---
    const [projectName, setProjectName] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [githubLinks, setGithubLinks] = useState<string[]>(['']);
    const [deploymentLink, setDeploymentLink] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTechnologies, setSelectedTechnologies] = useState<SelectedTechnology[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    // --- Control States ---
    const [techInput, setTechInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [collaboratorEmail, setCollaboratorEmail] = useState('');

    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const [showDismissableError, setShowDismissableError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(false);
    const [submitErrorData, setSubmitErrorData] = useState<any>(null);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        basics: true, media: false, links: false, details: true, team: false,
    });
    const [searchedUser, setSearchedUser] = useState<UserLookupData | null>(null);
    const [isSearching, setIsSearching] = useState(false); // Стан для кнопки "Знайти"

    // --- Refs and Auth data ---
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const isTechLoading = isTechsLoading; // Використовуємо isTechsLoading для елементів, які раніше використовували isTechLoading

    const [
        lookupUser,
        { data: foundUser, isFetching: isUserFetching, error: userLookupError }
    ] = useLazyLookupUserByEmailQuery();

    // --- Handlers ---
    const toggleSection = (sectionId: string) => { setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] })); };
    const handleDismissError = () => { setShowDismissableError(false); setSubmitError(false); };
    const updateProgress = (fileId: string, progress: number) => { setMediaFiles(prev => prev.map(f => f.id === fileId ? { ...f, uploadProgress: progress, uploadError: false } : f)); };
    const handleAddTechnology = (tech: SelectedTechnology) => { if (!selectedTechnologies?.find(t => t.id === tech.id)) { setSelectedTechnologies([...selectedTechnologies, tech]); setTechInput(''); setShowSuggestions(false); } };
    const handleRemoveTechnology = (techId: string) => { setSelectedTechnologies(selectedTechnologies.filter(t => t.id !== techId)); };
    const handleTechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setTechInput(e.target.value); setShowSuggestions(true); };
    const handleAddGithubLink = () => setGithubLinks([...githubLinks, '']);
    const handleRemoveGithubLink = (index: number) => { if (githubLinks.length > 1) setGithubLinks(githubLinks.filter((_, i) => i !== index)); };
    const handleGithubLinkChange = (index: number, value: string) => { const newLinks = [...githubLinks]; newLinks[index] = value; setGithubLinks(newLinks); };
    const handleRemoveCollaborator = (id: string) => { setCollaborators(collaborators.filter(c => c.id !== id)); };
    const handleSetMainImage = (id: string) => { setMediaFiles(mediaFiles.map(file => ({ ...file, isMain: file.id === id }))); };
    const handleRemoveMedia = (id: string) => { const fileToRemove = mediaFiles.find(f => f.id === id); const updatedFiles = mediaFiles.filter(file => file.id !== id); if (updatedFiles.length > 0 && fileToRemove?.isMain) updatedFiles[0].isMain = true; setMediaFiles(updatedFiles); };
    const handleSearchUser = () => {
        const email = collaboratorEmail.trim();
        if (email) {
            setIsSearching(true);
            setSearchedUser(null);
            lookupUser(email);
        }
    };
    const handleAddCollaborator = () => {
        if (searchedUser && !collaborators.find(c => c.id === searchedUser.id)) {
            setCollaborators(prev => [...prev, {
                id: searchedUser.id,
                name: searchedUser.name,
                email: searchedUser.email,
                avatar: searchedUser.avatarUrl
            }]);
            setSearchedUser(null);
            setCollaboratorEmail('');
        }
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => { /* Full upload logic here */ };
    const renderMarkdown = (text: string): string => { return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); };

    // --- Memos and Submission Check ---
    const filteredSuggestions = useMemo(() => {
        const input = techInput.toLowerCase();

        // Використовуємо реальні завантажені технології
        const unselectedTechnologies = allTechnologies.filter(tech => !selectedTechnologies.find(t => t.id === tech.id));

        const startsWith = unselectedTechnologies.filter(tech => tech.name.toLowerCase().startsWith(input));
        const contains = unselectedTechnologies.filter(tech => tech.name.toLowerCase().includes(input) && !tech.name.toLowerCase().startsWith(input));

        return [...startsWith, ...contains].slice(0, 5);
    }, [techInput, allTechnologies, selectedTechnologies]);
    const canSubmit = mediaFiles.every(f => f.uploadProgress === 100 && !f.uploadError) && projectName.trim() !== '';
    const projectUpdateData = useMemo(() => { const uploadedMediaIds = mediaFiles.filter(f => f.serverId).map(f => f.serverId!);
            return {
                title: projectName,
                description: description,
                githubUrl: githubLinks.filter(link => link.trim()).join(','),
                demoUrl: deploymentLink,
                technologies: selectedTechnologies,
                mediaIds: uploadedMediaIds,
                subauthorIds: collaborators.map(c => c.id),
                previewId: mediaFiles.find(f => f.isMain && f.serverId)?.serverId || null,
                visible: visibility === 'private' ? 'PRIVATE' : 'PUBLIC', collaborators: collaborators }; },
        [projectName, description, githubLinks, deploymentLink, selectedTechnologies, mediaFiles, collaborators, visibility]);


    const handleSubmit = async () => {
        if (!canSubmit) { alert("Будь ласка, заповніть назву та дочекайтеся завантаження медіа."); return; }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const success = Math.random() > 0.1;
        if (success) {
            alert("Проект успішно оновлено!");
            navigate(`/project/view/${projectId || 'placeholder-id'}`);
        } else {
            setSubmitError(true); setSubmitErrorData({ data: { message: "Помилка сервера при оновленні (симуляція)." } }); setShowDismissableError(true);
        }
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (isSuccess && projectData) {
            // Розділення githubUrl на масив
            const links = projectData.githubUrl ? projectData.githubUrl.split(',').filter(link => link.trim()) : [''];

            // Мапінг медіафайлів (додавання клієнтських станів)
            const mappedMedia: MediaFile[] = projectData.media.map(m => ({
                id: m.id, // Використовуємо серверний ID як основний ID для спрощення
                url: m.url,
                type: m.type as 'image' | 'video',
                name: m.url.split('/').pop() || 'media_file',
                serverId: m.id,
                isMain: m.id === projectData.previewMediaId, // Встановлюємо isMain на основі previewMediaId
                uploadProgress: 100, // Вважаємо, що завантажено
                isUploading: false,
                uploadError: false,
            }));

            // Мапінг співавторів
            const mappedCollaborators: Collaborator[] = projectData.subauthors.map(s => ({
                id: s.id,
                name: s.username,
                email: s.email,
                avatar: s.avatarUrl,
            }));

            // Оновлення стану
            setProjectName(projectData.title || '');
            setDescription(projectData.description || '');
            setDeploymentLink(projectData.demoUrl || '');
            setGithubLinks(links);
            setSelectedTechnologies(projectData.technologies || []);
            setMediaFiles(mappedMedia);
            setCollaborators(mappedCollaborators);
            setVisibility(projectData.visible === 'PUBLIC' ? 'public' : 'private');

            // Встановлюємо перше медіа головним, якщо previewMediaId не встановлено
            if (mappedMedia.length > 0 && !projectData.previewMediaId) {
                setMediaFiles(prev => prev.map((f, i) => i === 0 ? { ...f, isMain: true } : f));
            }
        }
    }, [isSuccess, projectData]);

    useEffect(() => {
        // Оновлюємо стан, коли API повертає результат або помилку
        if (isUserFetching) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
            if (foundUser) {
                setSearchedUser(foundUser);
            } else if (userLookupError) {
                setSearchedUser(null); // Користувача не знайдено або помилка
            }
        }
    }, [isUserFetching, foundUser, userLookupError]);

    if (isProjectLoading) {
        return <Loading fullScreen text="Завантаження даних проекту для редагування..." />;
    }

    if (isProjectError || !projectData) {
        return (
            <ErrorMessage
                fullScreen
                title="Помилка завантаження проекту"
                message={ (projectError as any)?.data?.message || `Не вдалося завантажити проект з ID: ${projectId}.`}
                onDismiss={() => navigate(-1)} // Повернутися назад при помилці
                onRetry={() => { /* re-fetch logic is handled by RTK Query */ }}
            />
        );
    }
    // --- RENDER ---
    return (
        <div className="min-h-screen bg-background text-foreground relative ">
            {/* --- Backgrounds & Error Message --- */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/3 size-96 bg-pink-500/10 rounded-full blur-3xl" />

            {(submitError || showDismissableError) && (
                <ErrorMessage fullScreen title="Помилка оновлення" message={(submitErrorData as any)?.data?.message || "Не вдалося оновити проект."} onDismiss={handleDismissError} onRetry={() => { handleDismissError(); handleSubmit(); }} />
            )}

            {/* --- Main Content Container --- */}
            <div className="max-w-7xl mx-auto px-4 py-24 pt-16 sm:pt-24 min-h-[calc(100vh-6rem)]">

                {/* --- Sticky Header & Action Button --- */}
                <div className="sticky top-0 z-20 mb-8 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <Edit className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Редагування проекту: <span className='text-primary'>{projectName || 'Без назви'}</span></h1>
                            <p className="text-sm text-muted-foreground">ID: {projectId || 'Невідомий'}</p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canSubmit}
                        className="rounded-xl flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 shadow-md shadow-green-500/30 disabled:opacity-60"
                    >
                        {isSubmitting ? <Loading /> : <Check className="size-4" />}
                        {isSubmitting ? 'Оновлення...' : 'Зберегти зміни'}
                    </Button>
                </div>


                {/* --- ГРИД РЕДАГУВАННЯ ТА ПРЕВ'Ю --- */}
                <div className="grid lg:grid-cols-[2fr_1fr] gap-8">

                    {/* ЛІВА КОЛОНКА: ФОРМА РЕДАГУВАННЯ */}
                    <div className="space-y-6">

                        {/* 1. ОСНОВНА ІНФОРМАЦІЯ (BASICS) */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <SectionHeader title="Основні параметри" icon={FileText} isOpen={openSections.basics} onClick={() => toggleSection('basics')} />
                            <motion.div initial={false} animate={{ height: openSections.basics ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    {/* Project Name */}
                                    <div className="space-y-2"> <Label htmlFor="projectName">Назва проекту *</Label> <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Назва проекту..." className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20" /> </div>
                                    {/* Visibility */}
                                    <div className="space-y-3"> <Label>Видимість проекту</Label> <RadioGroup value={visibility} onValueChange={(val) => setVisibility(val as 'public' | 'private')}>
                                        <div className="space-y-3">
                                            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${ visibility === 'public' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30' }`}> <RadioGroupItem value="public" id="public" className="mt-1" /> <div className="flex-1"> <div className="flex items-center gap-2 mb-1"> <Globe className="size-4 text-primary" /> <span>Публічний</span> </div> <p className="text-sm text-muted-foreground"> Проект буде доступний для всіх </p> </div> </label>
                                            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${ visibility === 'private' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30' }`}> <RadioGroupItem value="private" id="private" className="mt-1" /> <div className="flex-1"> <div className="flex items-center gap-2 mb-1"> <Lock className="size-4 text-primary" /> <span>Приватний</span> </div> <p className="text-sm text-muted-foreground"> Тільки ви та співавтори бачать проект </p> </div> </label>
                                        </div>
                                    </RadioGroup> </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 2. ОПИС ТА ТЕХНОЛОГІЇ (DETAILS) */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <SectionHeader title="Опис та технології" icon={Code2} isOpen={openSections.details} onClick={() => toggleSection('details')} />
                            <motion.div initial={false} animate={{ height: openSections.details ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    {/* Description */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="description">Опис проекту *</Label>
                                            <Button type="button" variant="ghost" onClick={() => setShowMarkdownPreview(!showMarkdownPreview)} className="flex items-center gap-1 text-primary hover:text-primary/80"> <Eye className="size-4" /> {showMarkdownPreview ? 'Редагувати' : 'Переглянути'} </Button>
                                        </div>
                                        {!showMarkdownPreview ? (
                                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="# Опис проекту..." className="min-h-[300px] rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono" />
                                        ) : (
                                            <div className="min-h-[300px] rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 p-4 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }} />
                                        )}
                                    </div>
                                    {/* Technologies Input */}
                                    <div className="space-y-3">
                                        <Label htmlFor="techInput">Технології</Label>
                                        <div className="relative">
                                            <Input
                                                id="techInput"
                                                placeholder="React, Node.js..."
                                                value={techInput}
                                                onChange={handleTechInputChange}
                                                onFocus={() => setShowSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                disabled={isTechLoading}
                                                className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                            {showSuggestions && techInput.trim() && filteredSuggestions.length > 0 && (
                                                <div className="absolute z-20 w-full mt-8 bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                    {filteredSuggestions.map((tech) => (
                                                        <button
                                                            key={tech.id}
                                                            type="button"
                                                            // Виправлення: явне приведення типу для коректного виклику handleAddTechnology
                                                            onClick={() => handleAddTechnology(tech as SelectedTechnology)}
                                                            className="w-full text-left p-3 hover:bg-secondary/50 transition-colors"
                                                        >
                                                            {tech.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Selected Technologies Display */}
                                        {selectedTechnologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-36">
                                                {selectedTechnologies.map((tech) => ( <Badge key={tech.id} className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 backdrop-blur-sm pl-3 pr-2 py-1.5 gap-2"> {tech.name} <button type="button" onClick={() => handleRemoveTechnology(tech.id)} className="hover:text-destructive transition-colors"><X className="size-3" /></button> </Badge> ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 3. ПОСИЛАННЯ (LINKS) */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <SectionHeader title="Посилання" icon={Github} isOpen={openSections.links} onClick={() => toggleSection('links')} />
                            <motion.div initial={false} animate={{ height: openSections.links ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    {/* GitHub Links */}
                                    <div className="space-y-3">
                                        <Label>Посилання GitHub</Label>
                                        {githubLinks.map((link, index) => ( <div key={index} className="flex gap-2"> <Input type="url" placeholder="https://github.com/..." value={link} onChange={(e) => handleGithubLinkChange(index, e.target.value)} className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20" /> {githubLinks.length > 1 && ( <Button type="button" variant="ghost" onClick={() => handleRemoveGithubLink(index)} className="rounded-xl bg-secondary/50 border-border/50 hover:bg-destructive/20 hover:border-destructive"> <X className="size-4" /> </Button> )} </div> ))}
                                        <Button type="button" variant="ghost" onClick={handleAddGithubLink} className="flex items-center gap-2 text-primary hover:text-primary/80"> <Plus className="size-4" /> Додати репозиторій </Button>
                                    </div>
                                    {/* Deployment Link */}
                                    <div className="space-y-2">
                                        <Label htmlFor="deploymentLink" className="flex items-center gap-2"><LinkIcon className="size-4 text-primary" /> Посилання на deploy</Label>
                                        <Input id="deploymentLink" type="url" placeholder="https://my-project.vercel.app" value={deploymentLink} onChange={(e) => setDeploymentLink(e.target.value)} className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 4. МЕДІА (MEDIA MANAGER) */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <SectionHeader title="Медіа файли" icon={ImageIcon} isOpen={openSections.media} onClick={() => toggleSection('media')} />
                            <motion.div initial={false} animate={{ height: openSections.media ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    {/* Upload Buttons */}
                                    <div className="flex gap-3">
                                        <Button type="button" variant="ghost" onClick={() => imageInputRef.current?.click()} className="flex-1 rounded-2xl bg-secondary/50 border-border/50 hover:bg-secondary/70 hover:border-primary/50 gap-2 h-12"> <Upload className="size-4" /> Завантажити фото </Button>
                                        <input ref={imageInputRef} id="file-image" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                                        <Button type="button" variant="ghost" onClick={() => videoInputRef.current?.click()} className="flex-1 rounded-2xl bg-secondary/50 border-border/50 hover:bg-secondary/70 hover:border-primary/50 gap-2 h-12"> <Video className="size-4" /> Завантажити відео </Button>
                                        <input ref={videoInputRef} id="file-video" type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                                    </div>
                                    {/* Media List */}
                                    {mediaFiles.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"> {mediaFiles.map((file) => ( <div key={file.id} className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${ file.isMain ? 'border-primary shadow-lg shadow-primary/30' : 'border-border/50' } ${ file.uploadError ? 'border-destructive' : 'bg-secondary/50' }`}> <div className="aspect-video"> {file.type === 'image' ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <video src={file.url} title={file.name} className="w-full h-full object-cover bg-black" controls muted playsInline />} </div> {file.isUploading && file.uploadProgress < 100 && ( <div className="absolute inset-0 flex items-center justify-center bg-black/80"> <div className="p-4 w-4/5"> <p className="text-xs text-white mb-1">Завантаження... {Math.round(file.uploadProgress)}%</p> <Progress value={file.uploadProgress} className="h-1 bg-white/20" /> </div> </div> )} {file.uploadError && ( <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 p-2"> <p className="text-xs text-white text-center">Помилка завантаження.</p> </div> )} {file.uploadProgress === 100 && !file.isUploading && ( <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"> {!file.isMain && file.type === 'image' && ( <Button type="button" onClick={() => handleSetMainImage(file.id)} className="rounded-xl bg-primary/90 hover:bg-primary gap-1"> <Star className="size-3" /> Головне </Button> )} <Button type="button" variant="ghost" onClick={() => handleRemoveMedia(file.id)} className="rounded-xl"> <X className="size-3" /> </Button> </div> )} {file.isMain && ( <div className="absolute top-2 right-2"> <Badge className="bg-primary/90 backdrop-blur-sm gap-1"> <Star className="size-3" /> Головне </Badge> </div> )} </div> ))} </div> ) : ( <div className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center"> <ImageIcon className="size-12 text-muted-foreground mx-auto mb-3" /> <p className="text-muted-foreground">Медіа файли не додані</p> </div> )}
                                </div>
                            </motion.div>
                        </div>

                        {/* 5. КОМАНДА (TEAM) */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                            <SectionHeader title="Команда проекту" icon={Users} isOpen={openSections.team} onClick={() => toggleSection('team')} />
                            <motion.div initial={false} animate={{ height: openSections.team ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                                <div className="pt-4 space-y-6">
                                    {/* Collaborator Search */}
                                    <div className="space-y-3">
                                        <Label htmlFor="collaboratorEmail">Email співавтора</Label>
                                        <div className="flex gap-2"> <div className="relative flex-1"> <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /> <Input id="collaboratorEmail" placeholder="email@example.com" value={collaboratorEmail} onChange={(e) => setCollaboratorEmail(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())} disabled={isSearching} className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10" /> </div> <Button type="button" variant="secondary" onClick={handleSearchUser} disabled={isSearching || !collaboratorEmail.trim()} className="flex rounded-xl items-center justify-center hover:scale-105 bg-primary/90 hover:bg-primary gap-2 w-28"> {isSearching ? <Loading /> : <UserPlus className="size-4" />} {isSearching ? 'Пошук...' : 'Знайти'} </Button> </div>
                                        {/* Search Result */}
                                        <div className="min-h-[70px] pt-2">
                                            {searchedUser && (
                                                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-2xl border border-primary/30 shadow-md">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={searchedUser.avatarUrl} alt={searchedUser.name} />
                                                            <AvatarFallback className="bg-primary/10 text-primary">{searchedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="truncate">{searchedUser.name}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{searchedUser.email}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddCollaborator}
                                                        // Перевірка, чи користувач вже є у списку
                                                        disabled={collaborators.some(c => c.id === searchedUser.id)}
                                                        className="rounded-xl flex-shrink-0 bg-green-500/90 hover:bg-green-600/90 gap-1"
                                                    >
                                                        <Plus className="size-4" />
                                                        {collaborators.some(c => c.id === searchedUser.id) ? 'Додано' : 'Додати'}
                                                    </Button>
                                                </div>
                                            )}
                                            {!isSearching && userLookupError && collaboratorEmail.trim() && (
                                                <p className="text-sm text-destructive mt-2">Користувача з такою поштою не знайдено.</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Collaborators List */}
                                    {collaborators.length > 0 && (
                                        <div className="space-y-3"> <Label>Співавтори ({collaborators.length})</Label> <div className="space-y-2"> {collaborators.map((collab) => ( <div key={collab.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-all"> <Avatar className="size-10"> <AvatarImage src={collab.avatar} alt={collab.name} /> <AvatarFallback className="bg-primary/10 text-primary"> {collab.name?.charAt(0)?.toUpperCase() || 'U'} </AvatarFallback> </Avatar> <div className="flex-1 min-w-0"> <p className="truncate">{collab.name}</p> <p className="text-sm text-muted-foreground truncate">{collab.email}</p> </div> <Button type="button" variant="ghost" onClick={() => handleRemoveCollaborator(collab.id)} className="rounded-xl hover:bg-destructive/20 hover:text-destructive flex-shrink-0"> <X className="size-4" /> </Button> </div> ))} </div> </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                    </div>

                    {/* ПРАВА КОЛОНКА: ПРЕВ'Ю */}
                    <div className="lg:block hidden">
                        <ProjectPreview data={projectUpdateData} renderMarkdown={renderMarkdown} />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default EditProjectPage;