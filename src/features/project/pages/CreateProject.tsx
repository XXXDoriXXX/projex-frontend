import React, {useState, useEffect, useMemo, useRef} from "react";
import Button from "../../../components/Button.tsx";
import { Input } from "../../../components/input.tsx";
import { Label } from "../../../components/label.tsx";
import { RadioGroup, RadioGroupItem } from "../../../components/radio-group.tsx";
import { Progress } from "../../../components/Progress.tsx";
import {Textarea} from "../../../components/textarea";
import {Badge} from "../../../components/badge";
import {Avatar, AvatarFallback, AvatarImage} from "../../../components/avatar";


import {
    ArrowLeft, Check,
    ChevronRight,
    Code2,
    Eye,
    FileText,
    Github,
    Globe,
    ImageIcon,
    LinkIcon, Mail,
    Plus,
    Lock,
    Rocket, Star, Upload,
    UserPlus,
    Users,
    Video, X, Trophy
} from "lucide-react";
import {useCreateProjectMutation, useGetTechnologiesQuery} from "../api/projectApi.ts";
import Loading from "../../../components/Loading.tsx";
import ErrorMessage from "../../../components/ErrorMessage.tsx";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import type {RootState} from "../../../store.ts";
import {uploadMediaToServer} from "../services/mediaUploadService.ts";
import {useLazyLookupUserByEmailQuery, type UserLookupData} from "../../profile/api/userApi.ts";
interface CreateProjectPageProps {
    onNavigateBack?: () => void;
}

interface MediaFile {
    id: string;
    url: string;
    type: 'image' | 'video';
    name: string;
    isMain: boolean;


    serverId?: string;
    uploadProgress: number;
    isUploading: boolean;
    uploadError: boolean;
}

interface Collaborator {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

type ProjectStep = 'basics' | 'media' | 'links' | 'details' | 'team' | 'review';

const steps = [
    { id: 'basics' as ProjectStep, title: 'Основна інформація', icon: FileText, description: 'Назва та видимість' },
    { id: 'media' as ProjectStep, title: 'Медіа', icon: ImageIcon, description: 'Фото та відео' },
    { id: 'links' as ProjectStep, title: 'Посилання', icon: Github, description: 'GitHub та deploy' },
    { id: 'details' as ProjectStep, title: 'Деталі', icon: Code2, description: 'Технології та опис' },
    { id: 'team' as ProjectStep, title: 'Команда', icon: Users, description: 'Співавтори' },
    { id: 'review' as ProjectStep, title: 'Перегляд', icon: Rocket, description: 'Публікація' }
];
interface SelectedTechnology {
    id: string;
    name: string;
}
export function CreateProjectPage({ onNavigateBack }: CreateProjectPageProps) {
    const [currentStep, setCurrentStep] = useState<ProjectStep>('basics');
    const [projectName, setProjectName] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [githubLinks, setGithubLinks] = useState<string[]>(['']);
    const [deploymentLink, setDeploymentLink] = useState('');
    const [description, setDescription] = useState('');
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [techInput, setTechInput] = useState('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const navigate = useNavigate();
    const [showDismissableError, setShowDismissableError] = useState(false);
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    const userId = useSelector((state: RootState) => state.auth.user?.id || 'TEST_USER_ID');
    const [selectedTechnologies, setSelectedTechnologies] = useState<SelectedTechnology[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data: allTechnologies = [], isLoading: isTechLoading } = useGetTechnologiesQuery();
    const [collaboratorEmail, setCollaboratorEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<UserLookupData | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [lookupUser, { data: foundUser, isFetching, isError, error }] = useLazyLookupUserByEmailQuery();
    const token = useSelector((state: RootState) => state.auth.token);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [newlyCreatedProjectId, setNewlyCreatedProjectId] = useState<string | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const handleAddTechnology = (tech: SelectedTechnology) => {
        if (!selectedTechnologies.find(t => t.id === tech.id)) {
            setSelectedTechnologies([...selectedTechnologies, tech]);
            setTechInput('');
            setShowSuggestions(false);
        }
    };
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    const updateProgress = (fileId: string, progress: number) => {
        setMediaFiles(prev => prev.map(f => f.id === fileId ? { ...f, uploadProgress: progress, uploadError: false } : f));
    };
    const handleRemoveTechnology = (techId: string) => {
        setSelectedTechnologies(selectedTechnologies.filter(t => t.id !== techId));
    };

    const handleTechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTechInput(e.target.value);
        setShowSuggestions(true);
    };
    const handleAddCollaborator = () => {

        if (foundUser && !collaborators.find(c => c.id === foundUser.id)) {
            const newCollaborator: Collaborator = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                avatar: foundUser.avatarUrl,
            };
            setCollaborators([...collaborators, newCollaborator]);
            setCollaboratorEmail('');
            setSearchedUser(null);
        }
    };
    const handleSearchUser = () => {
        const email = collaboratorEmail.trim();
        if (email) {
            setIsSearching(true);
            lookupUser(email);
        }
    };
    useEffect(() => {
        if(!currentUserId){
            //navigate("/")
        }
        if (!isFetching) {
            setIsSearching(false);
            if (foundUser) {
                setSearchedUser(foundUser);
                console.log(foundUser);
            } else if (isError) {
                setSearchedUser(null);
            }
        }
    }, [isFetching, foundUser, isError, error]);
    const filteredSuggestions = React.useMemo(() => {
        const input = techInput.toLowerCase();

        const unselectedTechnologies = allTechnologies
            .filter(tech => !selectedTechnologies.find(t => t.id === tech.id));

        const startsWith = unselectedTechnologies.filter(tech =>
            tech.name.toLowerCase().startsWith(input)
        );

        const contains = unselectedTechnologies.filter(tech =>
            tech.name.toLowerCase().includes(input) &&
            !tech.name.toLowerCase().startsWith(input)
        );
        const sortedResults = [...startsWith, ...contains];

        return sortedResults.slice(0, 5);

    }, [techInput, allTechnologies, selectedTechnologies]);
    let [
        createProject,
        { isLoading: isSubmitting, isError: submitError, isSuccess: submitSuccess, error: submitErrorData }
    ] = useCreateProjectMutation();
    const handleAddGithubLink = () => {
        setGithubLinks([...githubLinks, '']);
    };
    const handleDismissError = () => {
        setShowDismissableError(false);
    };
    useEffect(() => {
        if (submitError) {
            setShowDismissableError(true);
        }
    }, [submitError]);
    const handleRemoveGithubLink = (index: number) => {
        if (githubLinks.length > 1) {
            setGithubLinks(githubLinks.filter((_, i) => i !== index));
        }
    };

    const handleGithubLinkChange = (index: number, value: string) => {
        const newLinks = [...githubLinks];
        newLinks[index] = value;
        setGithubLinks(newLinks);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = e.target.files;
        if (!files || files.length === 0 || !token) {
            alert('Authentication error or no file selected.');
            return;
        }

        const file = files[0];

        const clientId = Date.now().toString();
        const tempUrl = URL.createObjectURL(file);

        const newFile: MediaFile = {
            id: clientId,
            url: tempUrl,
            type,
            name: file.name,
            isMain: mediaFiles.length === 0,
            serverId: undefined,
            uploadProgress: 0,
            isUploading: true,
            uploadError: false
        };

        setMediaFiles(prev => [...prev, newFile]);

        try {
            const result = await uploadMediaToServer(file, token, (progress) => {
                updateProgress(clientId, progress);
            });
            setMediaFiles(prev => prev.map(f => {
                if (f.id === clientId) {

                    URL.revokeObjectURL(f.url);
                    return {
                        ...f,
                        serverId: result.id,
                        isUploading: false,
                        uploadProgress: 100,
                        url: result.url
                    };
                }
                return f;
            }));
        } catch (error) {
            console.error("Media upload error:", error);

            setMediaFiles(prev =>
                prev.map(f => {
                    if (f.id === clientId) {
                        return {
                            ...f,
                            isUploading: false,
                            uploadProgress: 0,
                            uploadError: true,
                            serverId: undefined,
                        };
                    }
                    return f;
                })
            );
        };
    }
    const handleSetMainImage = (id: string) => {
        setMediaFiles(mediaFiles.map(file => ({
            ...file,
            isMain: file.id === id
        })));
    };

    const handleRemoveMedia = (id: string) => {
        const updatedFiles = mediaFiles.filter(file => file.id !== id);
        if (updatedFiles.length > 0 && mediaFiles.find(f => f.id === id)?.isMain) {
            updatedFiles[0].isMain = true;
        }
        setMediaFiles(updatedFiles);
    };


    const handleRemoveCollaborator = (id: string) => {
        setCollaborators(collaborators.filter(c => c.id !== id));
    };

    const handleNextStep = () => {
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const handlePrevStep = () => {
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1].id);
        }
    };


    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/^### (.*$)/gim, '<h3 class="mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="mt-4 mb-2">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-secondary/70 px-2 py-1 rounded text-primary">$1</code>')
            .replace(/\n\n/g, '</p><p class="mb-2">')
            .replace(/\n/g, '<br>');

        return `<p class="mb-2">${html}</p>`;
    };

    const isStepCompleted = (stepId: ProjectStep) => {
        const stepIndex = steps.findIndex(s => s.id === stepId);
        return stepIndex < currentStepIndex;
    };

    const canProceed = () => {
        const allMediaUploaded = mediaFiles.every(f => f.uploadProgress === 100 && !f.uploadError);
        switch (currentStep) {
            case 'basics':
                return projectName.trim() !== '';
            case 'media':
                return allMediaUploaded; // Optional
            case 'links':
                return true; // Optional
            case 'details':
                return description.trim() !== '';
            case 'team':
                return true; // Optional
            default:
                return true;
        }
    };

    useEffect(() => {
        if (submitSuccess && !isSubmitting) {
            navigate(`/project/view/${newlyCreatedProjectId}`);
        }
    }, [submitSuccess, isSubmitting, navigate, userId]);
    const projectData = useMemo(() => {
        const uploadedMediaIds = mediaFiles
            .filter(f => f.serverId)
            .map(f => f.serverId!);
        return {
            userId: userId,
            title: projectName,
            description: description,
            githubUrl: githubLinks.filter(link => link.trim()).join(','),
            demoUrl: deploymentLink,
            technologies: selectedTechnologies.map(tech => tech.id),
            mediaIds: uploadedMediaIds,
            subauthorIds: collaborators.map(c => c.id),
            previewId: mediaFiles.find(f => f.isMain && f.serverId)?.serverId || null,
            visible: visibility === 'public' ? null : 'PRIVATE'

        };
    }, [
        userId, projectName, description, githubLinks, deploymentLink,
        selectedTechnologies, mediaFiles
    ]);
    const handleSubmit = async () => {
        try {
            const result = await createProject(projectData).unwrap();

            const newProjectId = result.data.id;
            setNewlyCreatedProjectId(newProjectId);
        } catch (error) {
            console.error("Submission failed:", error);
        }
    };
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
                                <h2 className="text-xs sm:text-sm">Створення проєкту</h2>
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
            <div className="relative min-h-screen px-3 py-20 pt-28 sm:px-6 sm:pt-32">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-6">

                        <div className="hidden lg:block">
                            <div className="sticky top-32 bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-6 shadow-2xl">
                                <h3 className="mb-6">Прогрес створення</h3>
                                <div className="space-y-4">
                                    {steps.map((step, index) => {
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

                        {/* Mobile Step Indicator */}
                        <div className="lg:hidden mb-6">
                            <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-2xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {steps.map((step, index) => {
                                        const StepIcon = step.icon;
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

                        {/* Step Content */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl min-h-[600px] flex flex-col">
                            {/* Відображення помилок та завантаження */}
                            {isSubmitting && <Loading fullScreen text="Публікація проекту..." />}
                            {(submitError || showDismissableError) && (
                                <ErrorMessage
                                    fullScreen
                                    title="Помилка публікації"
                                    message={(submitErrorData as any)?.data?.message || "Не вдалося створити проект. Спробуйте пізніше."}

                                    onDismiss={handleDismissError}
                                    onRetry={() => {
                                        handleDismissError();
                                        createProject(projectData);
                                    }}
                                />
                            )}
                            <div className="flex-1">

                                {currentStep === 'basics' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                                <FileText className="size-6 text-white" />
                                            </div>
                                            <div>
                                                <h2>Основна інформація</h2>
                                                <p className="text-muted-foreground">Назвіть свій проект та оберіть видимість</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="projectName">Назва проекту *</Label>
                                            <Input
                                                id="projectName"
                                                type="text"
                                                placeholder="Моя крута ідея..."
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Видимість проекту</Label>
                                            <RadioGroup value={visibility} onValueChange={(val) => setVisibility(val as 'public' | 'private')}>
                                                <div className="space-y-3">
                                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                        visibility === 'public'
                                                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                            : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                                                    }`}>
                                                        <RadioGroupItem value="public" id="public" className="mt-1" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Globe className="size-4 text-primary" />
                                                                <span>Публічний</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Проект буде доступний для всіх користувачів платформи
                                                            </p>
                                                        </div>
                                                    </label>

                                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                        visibility === 'private'
                                                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                            : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                                                    }`}>
                                                        <RadioGroupItem value="private" id="private" className="mt-1" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Lock className="size-4 text-primary" />
                                                                <span>Приватний</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Тільки ви та ваші співавтори можуть бачити проект
                                                            </p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                )}
                                    {currentStep === 'media' && (
                                        <div className="space-y-6 animate-in fade-in duration-500">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                                    <ImageIcon className="size-6 text-white" />
                                                </div>
                                                <div>
                                                    <h2>Медіа файли</h2>
                                                    <p className="text-muted-foreground">Додайте фото та відео вашого проекту</p>
                                                </div>
                                            </div>


                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => imageInputRef.current?.click()}
                                                    className="flex w-full sm:w-auto justify-center gap-2"
                                                >
                                                    <Upload className="size-6" />
                                                    Завантажити фото
                                                </Button>

                                                <input
                                                    ref={imageInputRef}
                                                    id="file-image"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, 'image')}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => videoInputRef.current?.click()}
                                                    className="flex w-full sm:w-auto justify-center gap-2"
                                                >
                                                    <Video className="size-6" />
                                                    Завантажити відео
                                                </Button>

                                                <input
                                                    ref={videoInputRef}
                                                    id="file-video"
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, 'video')}
                                                />
                                            </div>

                                            {mediaFiles.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {mediaFiles.map((file) => (
                                                        <div
                                                            key={file.id}

                                                            className={`relative group rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                                file.isMain ? 'border-primary shadow-lg shadow-primary/30' : 'border-border/50'
                                                            } ${
                                                                file.uploadError ? 'border-destructive' : 'bg-secondary/50'
                                                            }`}
                                                        >
                                                            <div className="aspect-video">
                                                                <div className="aspect-video">
                                                                    {file.type === 'image' && file.url && (

                                                                        <img
                                                                            src={file.url}
                                                                            alt={file.name || "Project media"}
                                                                            className="w-full h-full object-cover"
                                                                        />

                                                                    )}
                                                                    {file.type === 'video' && file.url && (

                                                                        <video
                                                                            src={file.url}
                                                                            controls
                                                                            className="w-full h-full object-cover"
                                                                        >
                                                                            Ваш браузер не підтримує тег video.
                                                                        </video>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {file.isUploading && file.uploadProgress < 100 && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                                                    <div className="p-4 w-4/5">
                                                                        <p className="text-xs text-white mb-1">Завантаження... {file.uploadProgress}%</p>
                                                                        <Progress value={file.uploadProgress} className="h-1 bg-white/20" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {file.uploadError && (
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/80 p-2">
                                                                    <p className="text-sm text-white text-center mb-2">Помилка завантаження.</p>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => handleRemoveMedia(file.id)}
                                                                        variant="danger"
                                                                        className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 h-auto"
                                                                    >
                                                                        <X className="size-4" /> Видалити
                                                                    </Button>
                                                                </div>
                                                            )}


                                                            {file.uploadProgress === 100 && !file.uploadError && (
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2
                                            sm:opacity-0 md:opacity-0 lg:opacity-0 ">

                                                                </div>
                                                            )}


                                                            {file.uploadProgress === 100 && !file.uploadError && (
                                                                <>

                                                                    <Button
                                                                        type="button"
                                                                        variant="danger"
                                                                        onClick={() => handleRemoveMedia(file.id)}
                                                                        className="absolute top-2 left-2 z-10 rounded-full p-1.5 bg-black/50 hover:bg-destructive/70 transition-all shadow-lg"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </Button>

                                                                    {!file.isMain && file.type === 'image' && (

                                                                        <Button
                                                                            onClick={() => handleSetMainImage(file.id)}
                                                                            className="absolute top-2 right-2 z-10 rounded-full h-4 p-1.5 bg-black/50 hover:bg-primary transition-all shadow-lg"
                                                                        >
                                                                            <Star className="size-3" />
                                                                        </Button>
                                                                    )}


                                                                    {file.isMain && (
                                                                        <div className="absolute top-2 right-2 z-10">
                                                                            <Badge className="bg-primary/90 backdrop-blur-sm gap-1">
                                                                                <Star className="size-3" />
                                                                                Головне
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center">
                                                    <ImageIcon className="size-12 text-muted-foreground mx-auto mb-3" />
                                                    <p className="text-muted-foreground mb-2">Медіа файли не додані</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Додайте фото або відео, щоб показати ваш проект
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {currentStep === 'links' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                                <Github className="size-6 text-white" />
                                            </div>
                                            <div>
                                                <h2>Посилання</h2>
                                                <p className="text-muted-foreground">GitHub репозиторії та deployment</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Посилання GitHub</Label>
                                            {githubLinks.map((link, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row gap-2">
                                                    <Input
                                                        type="url"
                                                        placeholder="https://github.com/username/repo"
                                                        value={link}
                                                        onChange={(e) => handleGithubLinkChange(index, e.target.value)}
                                                        className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    {githubLinks.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveGithubLink(index)}
                                                            className="rounded-xl w-full sm:w-auto justify-center bg-secondary/50 border-border/50 hover:bg-destructive/20 hover:border-destructive"
                                                        >
                                                            <X className="size-4 mr-2 sm:mr-0" />
                                                            <span className="sm:hidden">Видалити</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleAddGithubLink}
                                                className="flex w-full sm:w-auto justify-center gap-2 hover:scale-0"
                                            >
                                                <Plus className="size-6" />
                                                Додати репозиторій
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="deploymentLink">
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon className="size-4 text-primary" />
                                                    Посилання на опублікований проект
                                                </div>
                                            </Label>
                                            <Input
                                                id="deploymentLink"
                                                type="url"
                                                placeholder="https://my-project.vercel.app"
                                                value={deploymentLink}
                                                onChange={(e) => setDeploymentLink(e.target.value)}
                                                className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'details' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                                <Code2 className="size-6 text-white" />
                                            </div>
                                            <div>
                                                <h2>Деталі проекту</h2>
                                                <p className="text-muted-foreground">Технології та опис</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="techInput">Технології</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="techInput"
                                                    type="text"
                                                    placeholder="React, TypeScript, Node.js..."
                                                    value={techInput}
                                                    onChange={handleTechInputChange}
                                                    onFocus={() => setShowSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                    className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    disabled={isTechLoading}
                                                />
                                                {showSuggestions && techInput.trim() && filteredSuggestions.length > 0 && (
                                                    <div className="absolute z-20 w-full mt-8 bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                        {filteredSuggestions.map((tech) => (
                                                            <button
                                                                key={tech.id}
                                                                type="button"
                                                                onClick={() => handleAddTechnology(tech)}
                                                                className="w-full text-left p-3 hover:bg-secondary/50 transition-colors"
                                                            >
                                                                {tech.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedTechnologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {selectedTechnologies.map((tech) => (
                                                        <Badge
                                                            key={tech.id}
                                                            className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 backdrop-blur-sm pl-3 pr-2 py-1.5 gap-2"
                                                        >
                                                            {tech.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTechnology(tech.id)}
                                                                className="hover:text-destructive transition-colors"
                                                            >
                                                                <X className="size-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {technologies.map((tech) => (
                                                        <Badge
                                                            key={tech}
                                                            className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 backdrop-blur-sm pl-3 pr-2 py-1.5 gap-2"
                                                        >
                                                            {tech}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTechnology(tech)}
                                                                className="hover:text-destructive transition-colors"
                                                            >
                                                                <X className="size-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="description">Опис проекту *</Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                                                    className="flex gap-8 hover:scale-10"
                                                >
                                                    <Eye className="size-6" />
                                                    {showMarkdownPreview ? 'Редагувати' : 'Переглянути'}
                                                </Button>
                                            </div>

                                            {!showMarkdownPreview ? (
                                                <Textarea
                                                    id="description"
                                                    placeholder="# Мій проект&#10;&#10;Опис того, що робить проект...&#10;&#10;## Особливості&#10;- Особливість 1&#10;- Особливість 2&#10;&#10;**Підтримка Markdown**"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="min-h-[300px] rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono"
                                                />
                                            ) : (
                                                <div
                                                    className="min-h-[300px] rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 p-4 prose prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
                                                />
                                            )}

                                            <p className="text-sm text-muted-foreground">
                                                Підтримує Markdown: # заголовок, **жирний**, *курсив*, `код`
                                            </p>
                                        </div>
                                    </div>
                                )}


                                {currentStep === 'team' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                                <Users className="size-6 text-white" />
                                            </div>
                                            <div>
                                                <h2>Команда проекту</h2>
                                                <p className="text-muted-foreground">Додайте співавторів проекту</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="collaboratorEmail">Email співавтора</Label>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative flex-1">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                    <Input
                                                        id="collaboratorEmail"
                                                        type="email"
                                                        placeholder="collaborator@example.com"
                                                        value={collaboratorEmail}
                                                        onChange={(e) => setCollaboratorEmail(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())}
                                                        className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-10 h-12" // Додано h-12
                                                        disabled={isSearching}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleSearchUser}
                                                    disabled={isSearching || !collaboratorEmail.trim()}

                                                    className="flex w-full sm:w-auto justify-center rounded-xl hover:scale-110 bg-primary/90 hover:bg-primary gap-2 h-12"
                                                >
                                                    {isSearching ? <Loading /> : <UserPlus className="size-6" />}
                                                    {isSearching ? 'Пошук...' : 'Знайти'}
                                                </Button>
                                            </div>
                                            <div className="min-h-10">
                                                {isFetching ? (
                                                    <p className="text-sm text-primary/70">Шукаємо користувача...</p>
                                                ) : searchedUser ? (
                                                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-primary/50 shadow-md">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={searchedUser.avatarUrl} alt={searchedUser.name} />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {searchedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate font-semibold">{searchedUser.name}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{searchedUser.email}</p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddCollaborator} // Додаємо знайденого
                                                            disabled={collaborators.some(c => c.id === searchedUser.id)}
                                                            className="rounded-xl bg-primary/90 hover:bg-primary flex-shrink-0"
                                                        >
                                                            {collaborators.some(c => c.id === searchedUser.id) ? 'Додано' : 'Додати'}
                                                        </Button>
                                                    </div>
                                                ) : isError ? (
                                                    <p className="text-sm text-destructive">Користувач не знайдений або помилка сервера.</p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {collaborators.length > 0 ? (
                                            <div className="space-y-3">
                                                <Label>Співавтори ({collaborators.length})</Label>
                                                <div className="space-y-2">
                                                    {collaborators.map((collab) => (
                                                        <div
                                                            key={collab.id}
                                                            className="flex items-center flex-wrap sm:flex-nowrap gap-3 p-3 bg-secondary/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-all"
                                                        >
                                                            <Avatar className="size-10">
                                                                <AvatarImage src={collab.avatar} alt={collab.name} />
                                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                                    {collab.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="truncate">{collab.name}</p>
                                                                <p className="text-sm text-muted-foreground truncate">{collab.email}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveCollaborator(collab.id)}
                                                                className="rounded-xl hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                                                            >
                                                                <X className="size-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center">
                                                <Users className="size-12 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-muted-foreground mb-2">Співавтори не додані</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Додайте учасників команди, які працювали над проектом
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 'review' && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                                <Rocket className="size-6 text-white" />
                                            </div>
                                            <div>
                                                <h2>Перевірте інформацію</h2>
                                                <p className="text-muted-foreground">Переконайтеся, що все вірно перед публікацією</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">

                                            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-muted-foreground">Назва проекту</Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => setCurrentStep('basics')}
                                                        className="text-primary hover:text-primary/80"
                                                    >
                                                        Редагувати
                                                    </Button>
                                                </div>
                                                <p className="mb-2">{projectName || 'Не вказано'}</p>
                                                <div className="flex items-center gap-2">
                                                    {visibility === 'public' ? (
                                                        <>
                                                            <Globe className="size-4 text-primary" />
                                                            <span className="text-sm text-muted-foreground">Публічний проект</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="size-4 text-primary" />
                                                            <span className="text-sm text-muted-foreground">Приватний проект</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {mediaFiles.length > 0 && (
                                                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Label className="text-muted-foreground">Медіа</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => setCurrentStep('media')}
                                                            className="text-primary hover:text-primary/80"
                                                        >
                                                            Редагувати
                                                        </Button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {mediaFiles.slice(0, 4).map((file) => (
                                                            <div key={file.id} className="size-16 rounded-xl overflow-hidden bg-secondary border border-border/50">
                                                                {file.type === 'image' ? (
                                                                    <img
                                                                        src={file.url}
                                                                        alt={file.name || "Project media"}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Video className="size-6 text-primary" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {mediaFiles.length > 4 && (
                                                            <div className="size-16 rounded-xl bg-secondary border border-border/50 flex items-center justify-center">
                                                                <span className="text-sm text-muted-foreground">+{mediaFiles.length - 4}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {technologies.length > 0 && (
                                                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Label className="text-muted-foreground">Технології</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => setCurrentStep('details')}
                                                            className="text-primary hover:text-primary/80"
                                                        >
                                                            Редагувати
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {technologies.map((tech) => (
                                                            <Badge key={tech} className="bg-primary/10 text-primary border-primary/30">
                                                                {tech}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {collaborators.length > 0 && (
                                                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Label className="text-muted-foreground">Команда ({collaborators.length + 1})</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => setCurrentStep('team')}
                                                            className="text-primary hover:text-primary/80"
                                                        >
                                                            Редагувати
                                                        </Button>
                                                    </div>
                                                    <div className="flex -space-x-2">
                                                        {collaborators.slice(0, 5).map((collab) => (
                                                            <Avatar key={collab.id} className="size-8 border-2 border-background">
                                                                <AvatarImage src={collab.avatar} alt={collab.name} />
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                    {collab.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {collaborators.length > 5 && (
                                                            <div className="size-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                                                                <span className="text-xs text-muted-foreground">+{collaborators.length - 5}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {(githubLinks.some(l => l.trim()) || deploymentLink) && (
                                                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Label className="text-muted-foreground">Посилання</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => setCurrentStep('links')}
                                                            className="text-primary hover:text-primary/80"
                                                        >
                                                            Редагувати
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        {githubLinks.filter(l => l.trim()).map((link, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                                                <Github className="size-4" />
                                                                <span className="truncate">{link}</span>
                                                            </div>
                                                        ))}
                                                        {deploymentLink && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <LinkIcon className="size-4" />
                                                                <span className="truncate">{deploymentLink}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 mt-6 border-t border-border/50 gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handlePrevStep}
                                    disabled={currentStepIndex === 0}
                                    className="rounded-xl flex w-full sm:w-auto justify-center py-3 bg-secondary/50 border-border/50 hover:bg-secondary/70 disabled:opacity-50"
                                >
                                    <ArrowLeft className="size-6 mr-2" />
                                    Назад
                                </Button>

                                {currentStep === 'review' ? (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!canProceed()}
                                        className="rounded-xl w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/30 gap-2"
                                    >
                                        <Rocket className="size-4" />
                                        Опублікувати проект
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={!canProceed()}
                                        className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
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
};

export default CreateProjectPage;