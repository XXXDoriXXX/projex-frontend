import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { DetailedProject } from '../../../shared/types/Project.ts';

export interface MediaFile { id: string; url: string; type: 'image' | 'video'; name: string; isMain: boolean; serverId?: string; uploadProgress: number; isUploading: boolean; uploadError: boolean; }
export interface Collaborator { id: string; name: string; email: string; avatar?: string; }
export interface SelectedTechnology { id: string; name: string; }
export interface ProjectUpdateData {
    title: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    technologies: string[];
    mediaIds: string[];
    subauthorIds: string[];
    previewId: string | null;
    collaborators: Collaborator[];
}
export interface LinkErrors { github: string | null; demo: string | null; }

const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};
const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/.*)?$/i;
const isGitHubUrlValid = (url: string) => {
    if (!url) return true;
    return GITHUB_REGEX.test(url);
};

interface EditProjectContextType {
    projectName: string;
    visibility: 'public' | 'private' | 'link';
    githubLinks: string[];
    deploymentLink: string;
    description: string;
    selectedTechnologies: SelectedTechnology[];
    mediaFiles: MediaFile[];
    collaborators: Collaborator[];
    privateLinkToken: string | null;
    // Сеттери
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setVisibility: React.Dispatch<React.SetStateAction<'public' | 'private' | 'link'>>;
    setGithubLinks: React.Dispatch<React.SetStateAction<string[]>>;
    setDeploymentLink: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setSelectedTechnologies: React.Dispatch<React.SetStateAction<SelectedTechnology[]>>;
    setMediaFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
    setCollaborators: React.Dispatch<React.SetStateAction<Collaborator[]>>;
    setPrivateLinkToken: React.Dispatch<React.SetStateAction<string | null>>;

    linkErrors: LinkErrors;
    projectUpdateData: ProjectUpdateData;
}

const EditProjectContext = createContext<EditProjectContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useEditProject = () => {
    const context = useContext(EditProjectContext);
    if (!context) {
        throw new Error('useEditProject must be used within an EditProjectProvider');
    }
    return context;
};

// --- Провайдер, який тримає всю логіку стану ---
interface EditProjectProviderProps {
    projectData: DetailedProject; // Початкові дані
    children: React.ReactNode;
}

export const EditProjectProvider: React.FC<EditProjectProviderProps> = ({ projectData, children }) => {
    // --- Увесь стан форми живе тут ---
    const [projectName, setProjectName] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private' | 'link'>('public');
    const [githubLinks, setGithubLinks] = useState<string[]>(['']);
    const [deploymentLink, setDeploymentLink] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTechnologies, setSelectedTechnologies] = useState<SelectedTechnology[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [privateLinkToken, setPrivateLinkToken] = useState<string | null>(null);
    const [linkErrors, setLinkErrors] = useState<LinkErrors>({ github: null, demo: null });

    const validateLinks = (ghLinks: string[], demoLink: string) => {
        let ghError: string | null = null;
        const nonBlankGhLinks = ghLinks.filter(l => l.trim());

        for (const link of nonBlankGhLinks) {
            if (!isGitHubUrlValid(link)) {
                ghError = 'Некоректне посилання на GitHub. Потрібен повний URL.';
                break;
            }
        }

        let demoError: string | null = null;
        if (demoLink.trim() && !isValidUrl(demoLink)) {
            demoError = 'Некоректний URL для опублікованого проекту.';
        }

        setLinkErrors({ github: ghError, demo: demoError });
    };

    useEffect(() => {
        if (projectData) {
            const links = projectData.githubUrl ? projectData.githubUrl.split(',').filter(link => link.trim()) : [''];
            if (links.length === 0) links.push('');


            const mappedMedia: MediaFile[] = projectData.media.map(m => ({
                id: m.id,
                url: m.url,
                type: m.type as 'image' | 'video',
                name: m.url.split('/').pop() || 'media_file',
                serverId: m.id,
                isMain: m.id === projectData.previewMediaId,
                uploadProgress: 100,
                isUploading: false,
                uploadError: false,
            }));

            const mappedCollaborators: Collaborator[] = projectData.subauthors.map(s => ({
                id: s.id,
                name: s.username,
                email: s.email,
                avatar: s.avatarUrl,
            }));

            setProjectName(projectData.title || '');
            setDescription(projectData.description || '');
            setDeploymentLink(projectData.demoUrl || '');
            setGithubLinks(links);
            setSelectedTechnologies(projectData.technologies || []);
            setMediaFiles(mappedMedia);
            setCollaborators(mappedCollaborators);
            validateLinks(links, projectData.demoUrl || '');

            if (mappedMedia.length > 0 && !mappedMedia.some(f => f.isMain)) {
                setMediaFiles(prev => prev.map((f, i) => i === 0 ? { ...f, isMain: true } : f));
            }
        }
    }, [projectData]);

    useEffect(() => {
        validateLinks(githubLinks, deploymentLink);
    }, [githubLinks, deploymentLink]);

    const projectUpdateData = useMemo(() => {
        const uploadedMediaIds = mediaFiles.filter(f => f.serverId).map(f => f.serverId!);
        return {
            title: projectName,
            description: description,
            githubUrl: githubLinks.filter(link => link.trim()).join(','),
            demoUrl: deploymentLink,
            technologies: selectedTechnologies.map(t => t.id),
            mediaIds: uploadedMediaIds,
            subauthorIds: collaborators.map(c => c.id),
            previewId: mediaFiles.find(f => f.isMain)?.serverId || null,
            collaborators: collaborators,
        };
    }, [projectName, description, githubLinks, deploymentLink, selectedTechnologies, mediaFiles, collaborators, visibility]);

    const value = {
        projectName, setProjectName,
        visibility, setVisibility,
        githubLinks, setGithubLinks,
        deploymentLink, setDeploymentLink,
        description, setDescription,
        selectedTechnologies, setSelectedTechnologies,
        mediaFiles, setMediaFiles,
        collaborators, setCollaborators,
        setPrivateLinkToken,
        privateLinkToken,
        linkErrors,
        projectUpdateData
    };

    return (
        <EditProjectContext.Provider value={value}>
            {children}
        </EditProjectContext.Provider>
    );
};