import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import ProjectPreview from '../../../components/ProjectPreview';

import { Check, Code2, Edit, FileText, Github, ImageIcon, Users } from 'lucide-react';
import { useGetProjectDetailsQuery, useUpdateProjectMutation } from "../api/projectApi.ts";

import { EditProjectProvider, useEditProject } from '../hooks/useEditProjectContext';

import { SectionHeader } from '../components/edit/SectionHeader';
import { SectionBasics } from '../components/edit/SectionBasics';
import { SectionDetails } from '../components/edit/SectionDetails';
import { SectionLinks } from '../components/edit/SectionLinks';
import { SectionMedia } from '../components/edit/SectionMedia';
import { SectionTeam } from '../components/edit/SectionTeam';

const renderMarkdown = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
};

const EditProjectPreview = () => {
    const { projectUpdateData } = useEditProject();
    return <ProjectPreview data={projectUpdateData} renderMarkdown={renderMarkdown} />;
};

// --- 1. EditProjectLayout ТЕПЕР ПРИЙМАЄ PROPS ---
const EditProjectLayout = ({ projectId, handleSubmit, isSubmitting, canSubmit }: any) => {
    // const { projectId, handleSubmit, isSubmitting, canSubmit } = useEditProjectPage(); // <-- ВИДАЛЕНО
    const { projectUpdateData } = useEditProject();

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        basics: true, media: false, links: false, details: true, team: false,
    });
    const toggleSection = (sectionId: string) => { setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] })); };

    return (
        <div className="max-w-7xl mx-auto px-4 py-24 pt-16 sm:pt-24 min-h-[calc(100vh-6rem)]">
            {/* --- Sticky Header & Action Button --- */}
            <div className="sticky top-0 z-20 mb-8 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Edit className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Редагування проекту: <span className='text-primary'>{projectUpdateData.title || 'Без назви'}</span></h1>
                        <p className="text-sm text-muted-foreground">ID: {projectId || 'Невідомий'}</p>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={handleSubmit} // <-- Використовує prop
                    disabled={!canSubmit} // <-- Використовує prop
                    className="rounded-xl flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 shadow-md shadow-green-500/30 disabled:opacity-60"
                >
                    {isSubmitting ? <Loading /> : <Check className="size-4" />} {/* Використовує prop */}
                    {isSubmitting ? 'Оновлення...' : 'Зберегти зміни'} {/* Використовує prop */}
                </Button>
            </div>

            {/* ... (решта верстки без змін) ... */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
                {/* ЛІВА КОЛОНКА: ФОРМА РЕДАГУВАННЯ */}
                <div className="space-y-6">
                    {/* 1. BASICS */}
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Основні параметри" icon={FileText} isOpen={openSections.basics} onClick={() => toggleSection('basics')} />
                        <motion.div initial={false} animate={{ height: openSections.basics ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionBasics />
                        </motion.div>
                    </div>
                    {/* 2. DETAILS */}
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Опис та технології" icon={Code2} isOpen={openSections.details} onClick={() => toggleSection('details')} />
                        <motion.div initial={false} animate={{ height: openSections.details ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionDetails />
                        </motion.div>
                    </div>
                    {/* 3. LINKS */}
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Посилання" icon={Github} isOpen={openSections.links} onClick={() => toggleSection('links')} />
                        <motion.div initial={false} animate={{ height: openSections.links ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionLinks />
                        </motion.div>
                    </div>
                    {/* 4. MEDIA */}
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Медіа файли" icon={ImageIcon} isOpen={openSections.media} onClick={() => toggleSection('media')} />
                        <motion.div initial={false} animate={{ height: openSections.media ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionMedia />
                        </motion.div>
                    </div>
                    {/* 5. TEAM */}
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Команда проекту" icon={Users} isOpen={openSections.team} onClick={() => toggleSection('team')} />
                        <motion.div initial={false} animate={{ height: openSections.team ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionTeam />
                        </motion.div>
                    </div>
                </div>

                {/* ПРАВА КОЛОНКА: ПРЕВ'Ю */}
                <div className="lg:block hidden">
                    <EditProjectPreview />
                </div>
            </div>
        </div>
    );
};

let pageLogic: any = {};
const useEditProjectPage = () => pageLogic;

export function EditProjectPage() {
    // --- 1. ВИКЛИКАЄМО ВСІ ХУКИ БЕЗ УМОВ ---
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [showDismissableError, setShowDismissableError] = useState(false);

    const {
        data: projectData,
        isLoading: isProjectLoading,
        isError: isProjectError,
        error: projectError,
    } = useGetProjectDetailsQuery(projectId!, {
        skip: !projectId,
    });

    const [
        updateProject,
        { isLoading: isSubmitting, isError: submitError, error: submitErrorData }
    ] = useUpdateProjectMutation();

    // --- 2. ЛОГІКА, ЯКА ЗАЛЕЖИТЬ ВІД ХУКІВ ---
    const handleSubmit = async (projectUpdateData: any) => {
        if (!projectId) return;
        try {
            const { collaborators: _, ...updateBody } = projectUpdateData;
            await updateProject({ id: projectId, body: updateBody }).unwrap();
            alert("Проект успішно оновлено!");
            navigate(`/project/view/${projectId}`);
        } catch (err) {
            console.error("Помилка оновлення проекту:", err);
            setShowDismissableError(true);
        }
    };

    pageLogic = {
        projectId,
        navigate,
        isSubmitting,
        handleSubmit: (data: any) => handleSubmit(data),
        canSubmit: (data: any, mediaFiles: any[]) =>
            mediaFiles.every((f: any) => f.uploadProgress === 100 && !f.uploadError) &&
            data.title.trim() !== '' &&
            !isSubmitting,
    };

    // --- 3. РОБИМО УМОВНІ ПОВЕРНЕННЯ (ТЕПЕР ЦЕ БЕЗПЕЧНО) ---
    if (!projectId) {
        return <ErrorMessage fullScreen title="Помилка" message="ID проекту не вказано." />;
    }

    if (isProjectLoading) {
        return <Loading fullScreen text="Завантаження даних проекту для редагування..." />;
    }

    if (isProjectError || !projectData) {
        return <ErrorMessage fullScreen title="Помилка завантаження проекту" message={(projectError as any)?.data?.message || `Не вдалося завантажити проект.`} onDismiss={() => navigate(-1)} />;
    }

    // --- 4. РЕНДЕР, ЯКЩО ВСЕ ДОБРЕ ---
    return (
        <EditProjectProvider projectData={projectData}>
            <div className="min-h-screen bg-background text-foreground relative ">
                {/* Фон */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
                <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/3 size-96 bg-pink-500/10 rounded-full blur-3xl" />

                {/* Помилка відправки форми */}
                {(submitError || showDismissableError) && (
                    <ErrorMessage fullScreen title="Помилка оновлення" message={(submitErrorData as any)?.data?.message || "Не вдалося оновити проект."} onDismiss={() => setShowDismissableError(false)} onRetry={() => { setShowDismissableError(false); /* handleSubmit_is_called_from_layout */ }} />
                )}

                <EditProjectLayoutWrapper />
            </div>
        </EditProjectProvider>
    );
}

// --- 2. EditProjectLayoutWrapper ТЕПЕР ПЕРЕДАЄ PROPS ---
const EditProjectLayoutWrapper = () => {
    const pageLogic = useEditProjectPage();
    const { projectUpdateData, mediaFiles } = useEditProject();

    // Обчислюємо значення
    const canSubmit = pageLogic.canSubmit(projectUpdateData, mediaFiles);
    const handleSubmit = () => pageLogic.handleSubmit(projectUpdateData);

    // pageLogic.canSubmit = canSubmit; // <-- ВИДАЛЕНО (це була помилка)
    // pageLogic.handleSubmit = handleSubmit; // <-- ВИДАЛЕНО (це була помилка)

    // Передаємо обчислені значення як props
    return (
        <EditProjectLayout
            projectId={pageLogic.projectId}
            isSubmitting={pageLogic.isSubmitting}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
        />
    );
}


export default EditProjectPage;