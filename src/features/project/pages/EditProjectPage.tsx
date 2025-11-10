import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import ProjectPreview from '../../../components/ProjectPreview';

import { Check, Code2, Edit, FileText, Github, ImageIcon, Users } from 'lucide-react';
import { useGetProjectDetailsQuery, useUpdateProjectMutation } from "../api/projectApi.ts";

import { EditProjectProvider, useEditProject, type ProjectUpdateData, type MediaFile } from '../hooks/useEditProjectContext';

import { SectionHeader } from '../components/edit/SectionHeader';
import { SectionBasics } from '../components/edit/SectionBasics';
import { SectionDetails } from '../components/edit/SectionDetails';
import { SectionLinks } from '../components/edit/SectionLinks';
import { SectionMedia } from '../components/edit/SectionMedia';
import { SectionTeam } from '../components/edit/SectionTeam';

const PROJECT_NAME_MIN_LENGTH = 3;
const PROJECT_NAME_MAX_LENGTH = 50;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 5000;

const renderMarkdown = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
};

const EditProjectPreview = () => {
    const { projectUpdateData } = useEditProject();

    return (
        <div className="sticky top-28 h-fit">
            <ProjectPreview data={projectUpdateData} renderMarkdown={renderMarkdown} />
        </div>
    );
};

const EditProjectLayout = ({ projectId, handleSubmit, isSubmitting, canSubmit }: {
    projectId: string | undefined;
    handleSubmit: () => void;
    isSubmitting: boolean;
    canSubmit: boolean;
}) => {
    const { projectUpdateData, linkErrors } = useEditProject();

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        basics: true, media: false, links: false, details: true, team: false,
    });
    const toggleSection = (sectionId: string) => { setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] })); };

    return (
        <div className="max-w-7xl mx-auto px-4 py-24 pt-16 sm:pt-24 min-h-[calc(100vh-6rem)] relative z-10">

            <div className="sticky top-0 z-20 mb-8 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Edit className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Редагування проекту: <span className='text-primary truncate max-w-xs sm:max-w-md'>{projectUpdateData.title || 'Без назви'}</span></h1>
                        <p className="text-sm text-muted-foreground">ID: {projectId || 'Невідомий'}</p>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="rounded-xl flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 shadow-md shadow-green-500/30 disabled:opacity-60 w-full sm:w-auto justify-center"
                >
                    {isSubmitting ? <Loading className="size-4 animate-spin" /> : <Check className="size-4" />}
                    {isSubmitting ? 'Оновлення...' : 'Зберегти зміни'}
                </Button>
            </div>

            <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
                <div className="space-y-6">
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Основні параметри" icon={FileText} isOpen={openSections.basics} onClick={() => toggleSection('basics')} />
                        <motion.div initial={false} animate={{ height: openSections.basics ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionBasics
                                minTitleLength={PROJECT_NAME_MIN_LENGTH}
                                maxTitleLength={PROJECT_NAME_MAX_LENGTH}
                                projectId={projectId}
                            />
                        </motion.div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Опис та технології" icon={Code2} isOpen={openSections.details} onClick={() => toggleSection('details')} />
                        <motion.div initial={false} animate={{ height: openSections.details ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionDetails
                                minDescLength={DESCRIPTION_MIN_LENGTH}
                                maxDescLength={DESCRIPTION_MAX_LENGTH}
                            />
                        </motion.div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Посилання" icon={Github} isOpen={openSections.links} onClick={() => toggleSection('links')} />
                        <motion.div initial={false} animate={{ height: openSections.links ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionLinks linkErrors={linkErrors} />
                        </motion.div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Медіа файли" icon={ImageIcon} isOpen={openSections.media} onClick={() => toggleSection('media')} />
                        <motion.div initial={false} animate={{ height: openSections.media ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionMedia />
                        </motion.div>
                    </div>
                    <div className="bg-card/50 backdrop-blur-2xl border border-border/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                        <SectionHeader title="Команда проекту" icon={Users} isOpen={openSections.team} onClick={() => toggleSection('team')} />
                        <motion.div initial={false} animate={{ height: openSections.team ? 'auto' : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                            <SectionTeam />
                        </motion.div>
                    </div>
                </div>

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
        { isLoading: isSubmitting, isError: submitError, error: submitErrorData, reset: resetMutationError }
    ] = useUpdateProjectMutation();

    const checkCanSubmit = (data: ProjectUpdateData, mediaFiles: MediaFile[], linkErrors: { github: string | null; demo: string | null }) => {
        const isMediaReady = mediaFiles.every((f: MediaFile) => f.uploadProgress === 100 && !f.uploadError);
        const isLinksValid = !linkErrors.github && !linkErrors.demo;

        const isTitleValid =
            data.title.trim().length >= PROJECT_NAME_MIN_LENGTH &&
            data.title.trim().length <= PROJECT_NAME_MAX_LENGTH;

        const isDescriptionValid =
            data.description.trim().length >= DESCRIPTION_MIN_LENGTH &&
            data.description.trim().length <= DESCRIPTION_MAX_LENGTH;

        return isMediaReady && isLinksValid && isTitleValid && isDescriptionValid;
    };

    const handleSubmit = async (projectUpdateData: ProjectUpdateData) => {
        if (!projectId) return;


        try {

            const { collaborators: _, ...updateBody } = projectUpdateData as any;

            await updateProject({ id: projectId, body: updateBody }).unwrap();
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
        handleSubmit: handleSubmit,
        checkCanSubmit: checkCanSubmit,
    };

    if (!projectId) {
        return <ErrorMessage fullScreen title="Помилка" message="ID проекту не вказано." />;
    }

    if (isProjectLoading) {
        return <Loading fullScreen text="Завантаження даних проекту для редагування..." />;
    }

    if (isProjectError || !projectData) {
        return <ErrorMessage fullScreen title="Помилка завантаження проекту" message={(projectError as any)?.data?.message || `Не вдалося завантажити проект.`} onDismiss={() => navigate(-1)} />;
    }

    return (
        <EditProjectProvider projectData={projectData}>
            <div className="min-h-screen bg-background text-foreground relative ">

                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
                <div className="absolute top-10 right-10 size-56 md:top-20 md:right-20 md:size-96 bg-primary/20 rounded-full blur-3xl z-0" />
                <div className="absolute bottom-10 left-10 size-56 md:bottom-20 md:left-20 md:size-96 bg-cyan-500/10 rounded-full blur-3xl z-0" />
                <div className="absolute top-1/3 left-1/3 size-56 md:size-96 bg-pink-500/10 rounded-full blur-3xl z-0" />
                <div className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50"/>

                {(submitError || showDismissableError) && (
                    <ErrorMessage
                        fullScreen
                        title="Помилка оновлення"
                        message={(submitErrorData as any)?.data?.message || "Не вдалося оновити проект."}
                        onDismiss={() => {
                            setShowDismissableError(false);
                            resetMutationError();
                        }}

                        onRetry={() => {
                            setShowDismissableError(false);
                            const { projectUpdateData: data, linkErrors, mediaFiles } = (useEditProjectPage() as any).getProjectData();
                            if (pageLogic.checkCanSubmit(data, mediaFiles, linkErrors)) {
                                resetMutationError();
                                pageLogic.handleSubmit(data);
                            }
                        }}
                    />
                )}

                <EditProjectLayoutWrapper />
            </div>
        </EditProjectProvider>
    );
}

const EditProjectLayoutWrapper = () => {
    const pageLogic = useEditProjectPage();
    const {
        projectUpdateData,
        mediaFiles,
        linkErrors,

        getProjectData
    } = useEditProject();

    pageLogic.getProjectData = () => ({ projectUpdateData, linkErrors, mediaFiles });

    const canSubmit = pageLogic.checkCanSubmit(projectUpdateData, mediaFiles, linkErrors);

    const handleSubmit = () => pageLogic.handleSubmit(projectUpdateData);

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