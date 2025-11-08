import React, {useState} from 'react';
import { useEditProject } from '../../hooks/useEditProjectContext';
import { Input } from '../../../../components/input';
import { Label } from '../../../../components/label';
import { RadioGroup, RadioGroupItem } from '../../../../components/radio-group';
import {Check, Copy, Globe, LinkIcon, Loader2, Lock } from 'lucide-react';
import {type ProjectVisibility, useChangeProjectVisibilityMutation} from "../../api/projectApi.ts";
import Button from "../../../../components/Button.tsx";

interface SectionBasicsProps {
    minTitleLength: number;
    maxTitleLength: number;
    projectId: string;
}

export const SectionBasics: React.FC<SectionBasicsProps> = ({ minTitleLength, maxTitleLength, projectId }) => {
    const {
        projectName, setProjectName,
        visibility, setVisibility,
        privateLinkToken, setPrivateLinkToken,
    } = useEditProject();
    const [
        changeVisibility,
        { isLoading: isChangingVisibility, isError: isVisibilityError, error: visibilityError, isSuccess: isVisibilitySuccess }
    ] = useChangeProjectVisibilityMutation();

    const [copied, setCopied] = useState(false);

    const isTooShort = projectName.length > 0 && projectName.length < minTitleLength;
    const isTooLong = projectName.length > maxTitleLength;
    const isInvalid = isTooShort || isTooLong;

    const handleVisibilityChange = async (newVisibility: 'public' | 'private' | 'link') => {
        setVisibility(newVisibility);

        let apiVisibility: ProjectVisibility;
        if (newVisibility === 'public') {
            apiVisibility = 'public';
        } else if (newVisibility === 'private') {
            apiVisibility = 'private';
        } else {
            apiVisibility = 'link';
        }

        try {
            const result = await changeVisibility({ id: projectId, visibility: apiVisibility }).unwrap();

            if (result.data.privateLinkToken) {
                setPrivateLinkToken(result.data.privateLinkToken);
            } else {
                setPrivateLinkToken(null);
            }

        } catch (error) {
            console.error("Помилка зміни видимості:", error);
        }
    };
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    const handleCopy = (link: string) => {
        copyToClipboard(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= maxTitleLength) {
            setProjectName(value);
        }
    };
    const projectLink = privateLinkToken ? `${window.location.origin}/project/view/${projectId}?token=${privateLinkToken}` : '';
    return (
        <div className="pt-4 space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
                <Label htmlFor="projectName">Назва проекту *</Label>
                <Input
                    id="projectName"
                    value={projectName}
                    onChange={handleNameChange}
                    placeholder={`Назва (від ${minTitleLength} до ${maxTitleLength} символів)...`}
                    className={`rounded-2xl bg-secondary/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 ${
                        isInvalid ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary'
                    }`}
                />
                <div className="flex justify-between items-center text-sm">
                    {isTooShort && (
                        <p className="text-destructive">Назва занадто коротка. Мінімум {minTitleLength} символи.</p>
                    )}
                    {isTooLong && (
                        <p className="text-destructive">Назва занадто довга. Максимум {maxTitleLength} символів.</p>
                    )}
                    {!isInvalid && <div />}
                    <p className={`${isInvalid ? 'text-destructive' : 'text-muted-foreground'} ml-auto`}>
                        {projectName.length}/{maxTitleLength}
                    </p>
                </div>
            </div>

            {/* Visibility */}
            <div className="space-y-3">
                <Label>Видимість проекту</Label>
                {isVisibilityError && (
                    <p className="text-sm text-destructive border border-destructive/50 p-2 rounded-xl">
                        Помилка зміни видимості: { (visibilityError as any)?.data?.message || 'Сервер не відповів.' }
                    </p>
                )}

                <RadioGroup
                    value={visibility}
                    onValueChange={handleVisibilityChange}
                    disabled={isChangingVisibility} // Блокуємо, поки триває запит
                >
                    <div className="space-y-3 relative">
                        {isChangingVisibility && (
                            <div className="absolute inset-0 bg-secondary/50 rounded-2xl z-10 flex items-center justify-center">
                                <Loader2 className="size-6 text-primary animate-spin" />
                            </div>
                        )}

                        {/* 1. Публічний */}
                        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'public' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30'}`}>
                            <RadioGroupItem value="public" id="public" className="mt-1" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe className="size-4 text-primary" /> <span>Публічний</span>
                                </div>
                                <p className="text-sm text-muted-foreground"> Проект доступний для всіх користувачів </p>
                            </div>
                        </label>

                        {/* 2. Приватний */}
                        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'private' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30'}`}>
                            <RadioGroupItem value="private" id="private" className="mt-1" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="size-4 text-primary" /> <span>Приватний</span>
                                </div>
                                <p className="text-sm text-muted-foreground"> Тільки ви та співавтори бачать проект </p>
                            </div>
                        </label>

                        {/* 3. Доступ за посиланням (Link) */}
                        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'link' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30'}`}>
                            <RadioGroupItem value="link" id="link" className="mt-1" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <LinkIcon className="size-4 text-primary" /> <span>Доступ за посиланням</span>
                                </div>
                                <p className="text-sm text-muted-foreground"> Проект доступний лише за унікальним токеном </p>
                            </div>
                        </label>
                    </div>
                </RadioGroup>
            </div>

            {visibility === 'link' && projectLink && (
                <div className="space-y-2 p-4 bg-secondary/50 rounded-2xl border border-primary/30 animate-in fade-in duration-300">
                    <Label className="text-primary flex items-center gap-2">
                        <LinkIcon className="size-4" /> Унікальне посилання для доступу:
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={projectLink}
                            readOnly
                            className="rounded-xl bg-background/70 font-mono text-xs sm:text-sm truncate"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleCopy(projectLink)}
                            className={`rounded-xl px-3 flex-shrink-0 ${copied ? 'bg-green-500/80 hover:bg-green-600/80' : 'bg-primary/90 hover:bg-primary'}`}
                        >
                            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Це посилання містить секретний токен. Не діліться ним публічно!
                    </p>
                </div>
            )}
        </div>
    );
};