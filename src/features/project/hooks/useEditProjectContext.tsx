import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { DetailedProject } from '../../../shared/types/Project.ts';

// --- Типи, які ми будемо використовувати у формі ---
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
    visible: 'PUBLIC' | 'PRIVATE';
    collaborators: Collaborator[]; // Це тільки для прев'ю
}

// --- Тип для нашого Context ---
interface EditProjectContextType {
    // Стан
    projectName: string;
    visibility: 'public' | 'private';
    githubLinks: string[];
    deploymentLink: string;
    description: string;
    selectedTechnologies: SelectedTechnology[];
    mediaFiles: MediaFile[];
    collaborators: Collaborator[];
    // Сеттери
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setVisibility: React.Dispatch<React.SetStateAction<'public' | 'private'>>;
    setGithubLinks: React.Dispatch<React.SetStateAction<string[]>>;
    setDeploymentLink: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setSelectedTechnologies: React.Dispatch<React.SetStateAction<SelectedTechnology[]>>;
    setMediaFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
    setCollaborators: React.Dispatch<React.SetStateAction<Collaborator[]>>;
    // Фінальні дані для відправки та прев'ю
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
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [githubLinks, setGithubLinks] = useState<string[]>(['']);
    const [deploymentLink, setDeploymentLink] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTechnologies, setSelectedTechnologies] = useState<SelectedTechnology[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    // --- Ефект для заповнення стану з projectData ---
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
            setVisibility(projectData.visible === 'PUBLIC' ? 'public' : 'private');

            if (mappedMedia.length > 0 && !mappedMedia.some(f => f.isMain)) {
                setMediaFiles(prev => prev.map((f, i) => i === 0 ? { ...f, isMain: true } : f));
            }
        }
    }, [projectData]);

    // --- 'projectUpdateData' тепер також живе в context ---
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
            visible: visibility === 'private' ? 'PRIVATE' : 'PUBLIC',
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
        projectUpdateData
    };

    return (
        <EditProjectContext.Provider value={value}>
            {children}
        </EditProjectContext.Provider>
    );
};