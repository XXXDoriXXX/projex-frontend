import React from 'react';
import { useEditProject } from '../../hooks/useEditProjectContext';
import { Input } from '../../../../components/input';
import { Label } from '../../../../components/label';
import Button from '../../../../components/Button';
import { LinkIcon, Plus, X } from 'lucide-react';

export const SectionLinks = () => {
    const {
        githubLinks, setGithubLinks,
        deploymentLink, setDeploymentLink
    } = useEditProject();

    const handleAddGithubLink = () => setGithubLinks([...githubLinks, '']);
    const handleRemoveGithubLink = (index: number) => {
        if (githubLinks.length > 1) setGithubLinks(githubLinks.filter((_, i) => i !== index));
    };
    const handleGithubLinkChange = (index: number, value: string) => {
        const newLinks = [...githubLinks];
        newLinks[index] = value;
        setGithubLinks(newLinks);
    };

    return (
        <div className="pt-4 space-y-6">
            {/* GitHub Links */}
            <div className="space-y-3">
                <Label>Посилання GitHub</Label>
                {githubLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            type="url"
                            placeholder="https://github.com/..."
                            value={link}
                            onChange={(e) => handleGithubLinkChange(index, e.target.value)}
                            className="rounded-2xl bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {githubLinks.length > 1 && (
                            <Button type="button" variant="ghost" onClick={() => handleRemoveGithubLink(index)} className="rounded-xl bg-secondary/50 border-border/50 hover:bg-destructive/20 hover:border-destructive">
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="ghost" onClick={handleAddGithubLink} className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Plus className="size-4" /> Додати репозиторій
                </Button>
            </div>
            {/* Deployment Link */}
            <div className="space-y-2">
                <Label htmlFor="deploymentLink" className="flex items-center gap-2">
                    <LinkIcon className="size-4 text-primary" /> Посилання на deploy
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
    );
};