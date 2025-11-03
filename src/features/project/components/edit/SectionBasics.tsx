import React from 'react';
import { useEditProject } from '../../hooks/useEditProjectContext';
import { Input } from '../../../../components/input';
import { Label } from '../../../../components/label';
import { RadioGroup, RadioGroupItem } from '../../../../components/radio-group';
import { Globe, Lock } from 'lucide-react';

export const SectionBasics = () => {
    const {
        projectName, setProjectName,
        visibility, setVisibility
    } = useEditProject();

    return (
        <div className="pt-4 space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
                <Label htmlFor="projectName">Назва проекту *</Label>
                <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Назва проекту..."
                    className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>
            {/* Visibility */}
            <div className="space-y-3">
                <Label>Видимість проекту</Label>
                <RadioGroup value={visibility} onValueChange={(val) => setVisibility(val as 'public' | 'private')}>
                    <div className="space-y-3">
                        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'public' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30'}`}>
                            <RadioGroupItem value="public" id="public" className="mt-1" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe className="size-4 text-primary" /> <span>Публічний</span>
                                </div>
                                <p className="text-sm text-muted-foreground"> Проект буде доступний для всіх </p>
                            </div>
                        </label>
                        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${visibility === 'private' ? 'bg-primary/10 border-primary shadow-md shadow-primary/20' : 'bg-secondary/30 border-border/50 hover:border-primary/30'}`}>
                            <RadioGroupItem value="private" id="private" className="mt-1" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="size-4 text-primary" /> <span>Приватний</span>
                                </div>
                                <p className="text-sm text-muted-foreground"> Тільки ви та співавтори бачать проект </p>
                            </div>
                        </label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
};