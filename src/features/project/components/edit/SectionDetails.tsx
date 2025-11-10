import React, { useState, useMemo } from 'react';
import { useEditProject, type SelectedTechnology } from '../../hooks/useEditProjectContext';
import { useGetTechnologiesQuery } from '../../api/projectApi';
import { Input } from '../../../../components/input';
import { Label } from '../../../../components/label';
import { Textarea } from '../../../../components/textarea';
import { Badge } from '../../../../components/badge';
import Button from '../../../../components/Button';
import { Eye, X } from 'lucide-react';

interface SectionDetailsProps {
    minDescLength: number;
    maxDescLength: number;
}

export const SectionDetails: React.FC<SectionDetailsProps> = ({ minDescLength, maxDescLength }) => {
    const {
        description, setDescription,
        selectedTechnologies, setSelectedTechnologies
    } = useEditProject();

    const [techInput, setTechInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

    const { data: allTechnologies = [], isLoading: isTechLoading } = useGetTechnologiesQuery();

    const isTooShort = description.length > 0 && description.length < minDescLength;
    const isTooLong = description.length > maxDescLength;
    const isInvalid = isTooShort || isTooLong;

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= maxDescLength) {
            setDescription(value);
        }
    };

    const handleTechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTechInput(e.target.value);
        setShowSuggestions(true);
    };

    const handleAddTechnology = (tech: SelectedTechnology) => {
        if (!selectedTechnologies?.find(t => t.id === tech.id)) {
            setSelectedTechnologies([...selectedTechnologies, tech]);
        }
        setTechInput('');
        setShowSuggestions(false);
    };

    const handleRemoveTechnology = (techId: string) => {
        setSelectedTechnologies(selectedTechnologies.filter(t => t.id !== techId));
    };

    const filteredSuggestions = useMemo(() => {
        const input = techInput.toLowerCase();
        if (!input) return [];
        const unselectedTechnologies = allTechnologies.filter(tech => !selectedTechnologies.find(t => t.id === tech.id));
        const startsWith = unselectedTechnologies.filter(tech => tech.name.toLowerCase().startsWith(input));
        const contains = unselectedTechnologies.filter(tech => tech.name.toLowerCase().includes(input) && !tech.name.toLowerCase().startsWith(input));
        return [...startsWith, ...contains].slice(0, 5);
    }, [techInput, allTechnologies, selectedTechnologies]);

    const renderMarkdown = (text: string): string => {
        // Залишаємо вашу функцію, але рекомендуємо використовувати бібліотеку (наприклад, marked)
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    };

    return (
        <div className="pt-4 space-y-6 h-auto">
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
                        <div className="absolute z-20 w-full mt-2 bg-card border border-border/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {filteredSuggestions.map((tech) => (
                                <button
                                    key={tech.id}
                                    type="button"
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
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedTechnologies.map((tech) => (
                            <Badge key={tech.id} className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 backdrop-blur-sm pl-3 pr-2 py-1.5 gap-2">
                                {tech.name}
                                <button type="button" onClick={() => handleRemoveTechnology(tech.id)} className="hover:text-destructive transition-colors">
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="description">Опис проекту *</Label>
                    <Button type="button" variant="ghost" onClick={() => setShowMarkdownPreview(!showMarkdownPreview)} className="flex items-center gap-1 text-primary hover:text-primary/80">
                        <Eye className="size-4" /> {showMarkdownPreview ? 'Редагувати' : 'Переглянути'}
                    </Button>
                </div>

                {!showMarkdownPreview ? (
                    <Textarea
                        id="description"
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder={`# Опис проекту (від ${minDescLength} до ${maxDescLength} символів)...`}
                        className={`min-h-[300px] rounded-2xl bg-secondary/50 backdrop-blur-sm font-mono ${
                            isInvalid ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary'
                        }`}
                    />
                ) : (
                    <div className="min-h-[300px] rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 p-4 prose prose-invert max-w-none"
                         dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
                    />
                )}

                {/* Лічильник та Повідомлення про помилку */}
                <div className="flex justify-between items-center text-sm">
                    <p className="text-muted-foreground">Підтримує Markdown.</p>
                    <p className={`${isInvalid ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {description.length}/{maxDescLength}
                    </p>
                </div>
                {(isTooShort || isTooLong) && (
                    <p className="text-sm text-destructive">
                        Опис має бути від {minDescLength} до {maxDescLength} символів.
                    </p>
                )}
            </div>
        </div>
    );
};