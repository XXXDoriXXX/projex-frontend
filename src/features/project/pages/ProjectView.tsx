import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    Heart,
    Github,
    ExternalLink,
    Calendar,
    Users,
    Code,
    ArrowLeft,
    Video,
    Share,
    FilePenLine, Archive, ArchiveRestore, UploadCloud
} from 'lucide-react';
import {
    type ProjectStatus,
    useAddViewMutation,
    useGetProjectDetailsQuery,
    useLikeProjectMutation,
    useUnlikeProjectMutation,
    useUpdateProjectStatusMutation
} from "../api/projectApi.ts";
import Loading from "../../../components/Loading.tsx";
import ErrorMessage from "../../../components/ErrorMessage.tsx";

import Button from '../../../components/Button';
import {useEffect, useRef, useState} from 'react';
import { Badge } from '../../../components/badge.tsx';
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/avatar.tsx";
import {Separator} from "../../../components/separator.tsx";
import {MotionEffect} from "../../../components/Animations/Motion/Motion-effect.tsx";
import {useSelector} from "react-redux";
import type {RootState} from "../../../store.ts";
import {renderMarkdown} from "../../../shared/utils/utils.ts";


interface ProjectViewPageProps {
    onNavigateBack?: () => void;
}

export default function ProjectPage({ onNavigateBack }: ProjectViewPageProps) {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: projectData,
        isLoading,
        isError,
        error
    } = useGetProjectDetailsQuery(id || '', {
        skip: !id,
    });

    const [addView] = useAddViewMutation();
    const [likeProject, { isLoading: isLiking, error: likeError }] = useLikeProjectMutation();
    const [unlikeProject, { isLoading: isUnliking, error: unlikeError }] = useUnlikeProjectMutation();

    const [updateProjectStatus, { isLoading: isUpdatingStatus, error: statusError }] = useUpdateProjectStatusMutation();

    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    useEffect(() => {
        const error = likeError || unlikeError || statusError
        if (error) {
            console.log((error as any).data?.error.message);
            const message = (error as any).data?.error.message
                || (error as any).error
                || 'unknown error occurred. Please try again.';
            setApiError(message);
        }
    }, [likeError, unlikeError, statusError]);
    React.useEffect(() => {
        if (projectData && !selectedMedia) {
            setSelectedMedia(projectData.media.length > 0 ? projectData.media[0] : null);
        }
    }, [projectData, selectedMedia]);

    const viewSentRef = useRef(false);

    React.useEffect(() => {
        let timerId: number;
        if (id && !viewSentRef.current) {
            viewSentRef.current = true;
            timerId = setTimeout(() => {
                addView(id);
            }, 3000);
        }
    }, [id, addView]);


    const handleLike = () => {
        setApiError(null);
        if (id && !isLiking && !isLiked) {
            likeProject(id);
        }
        else if(id && !isUnliking && isLiked) {
            unlikeProject(id);
        }
    };
    const handleEdit = () => {
       
        console.log("Відкрити вікно редагування для проекту:", id);
         navigate(`/project/edit/${id}`);
    };
    const handleNavigate = (path: string) => () => {
        navigate(path);
    }

    const isLiked = projectData?.isLiked;

    if (isLoading || !id) {
        return <Loading fullScreen text="Завантаження деталей проекту..." />;
    }

    if (isError || !projectData) {
        return (
            <ErrorMessage
                fullScreen
                title="Помилка завантаження"
                message={ (error as any)?.data?.message || "На жаль, такий проект не знайдено."}
                onDismiss={() => navigate(-1)}
                onRetry={() => {}}
            />
        );
    }
    const handleChangeStatus = async (newStatus: ProjectStatus) => {
        setApiError(null);
        if (!id || isUpdatingStatus) return;

        try {
            await updateProjectStatus({ id, status: newStatus }).unwrap();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const githubLinks = projectData.githubUrl ? projectData.githubUrl.split(',').filter(link => link.trim()) : [];
    const fadeTransition = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: 'easeInOut' }
    };
    const isOwner = currentUserId && projectData.author.id === currentUserId;
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/3 size-96 bg-pink-500/10 rounded-full blur-3xl" />
            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d1117]/80 border-b border-white/10">

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {onNavigateBack && (
                            <button
                                onClick={onNavigateBack}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Profile</span>
                            </button>
                        )}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{projectData.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{projectData.viewsCount} views</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart
                                            className={`w-4 h-4 cursor-pointer transition-colors ${
                                                isLiked ? 'fill-[#8b5cf6] text-[#8b5cf6]' : 'text-gray-400'
                                            }`}
                                            onClick={handleLike}
                                        />
                                        {/* ВИПРАВЛЕННЯ: Відображаємо тільки фактичну кількість лайків */}
                                        <span>{projectData.likesCount} likes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(projectData.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {isOwner && (
                                    <>
                                        <Button
                                            variant={"ghost"}
                                            onClick={handleEdit}
                                            className="flex w-auto items-center justify-center border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                        >
                                            <FilePenLine className="w-4 h-4 mr-2" />
                                            Edit Project
                                        </Button>

                                        {/* --- Кнопки для DRAFT --- */}
                                        {projectData.status === 'DRAFT' && (
                                            <>
                                                <Button
                                                    variant={"ghost"}
                                                    onClick={() => handleChangeStatus('PUBLISHED')}
                                                    disabled={isUpdatingStatus}
                                                    className="flex w-auto items-center justify-center border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                                                >
                                                    <UploadCloud className="w-4 h-4 mr-2" />
                                                    {isUpdatingStatus ? 'Publishing...' : 'Publish'}
                                                </Button>
                                                <Button
                                                    variant={"ghost"}
                                                    onClick={() => handleChangeStatus('ARCHIVED')}
                                                    disabled={isUpdatingStatus}
                                                    className="flex w-auto items-center justify-center border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                >
                                                    <Archive className="w-4 h-4 mr-2" />
                                                    {isUpdatingStatus ? 'Archiving...' : 'Archive'}
                                                </Button>
                                            </>
                                        )}

                                        {/* --- Кнопка для PUBLISHED --- */}
                                        {projectData.status === 'PUBLISHED' && (
                                            <Button
                                                variant={"ghost"}
                                                onClick={() => handleChangeStatus('ARCHIVED')}
                                                disabled={isUpdatingStatus}
                                                className="flex w-auto items-center justify-center border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                            >
                                                <Archive className="w-4 h-4 mr-2" />
                                                {isUpdatingStatus ? 'Archiving...' : 'Archive'}
                                            </Button>
                                        )}

                                        {/* --- Кнопка для ARCHIVED --- */}
                                        {projectData.status === 'ARCHIVED' && (
                                            <Button
                                                variant={"ghost"}
                                                onClick={() => handleChangeStatus('PUBLISHED')}
                                                disabled={isUpdatingStatus}
                                                className="flex w-auto items-center justify-center border-blue-500/50 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
                                            >
                                                <ArchiveRestore className="w-4 h-4 mr-2" />
                                                {isUpdatingStatus ? 'Publishing...' : 'Re-Publish'}
                                            </Button>
                                        )}
                                    </>
                                )}

                                {/* ... (Кнопки GitHub та Live Demo без змін) ... */}
                                {projectData.githubUrl && (
                                    githubLinks.map((link, index) => (
                                        <Button
                                            variant={"ghost"}
                                            key={index}
                                            onClick={() => window.open(link, '_blank')}
                                            className=" flex w-auto items-center justify-center"
                                        >
                                            <Github className="w-4 h-4 mr-2" />
                                            GitHub {githubLinks.length > 1 ? `(${index + 1})` : ''}
                                        </Button>
                                    ))
                                )}
                                {projectData.demoUrl && (
                                    <Button
                                        onClick={() => window.open(projectData.demoUrl, '_blank')}
                                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-all duration-300"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Live Demo
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <motion.div layout
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="lg:col-span-2 space-y-8">
                        {/* Media Gallery */}

                        {projectData.media.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                                <h2 className="text-2xl text-white mb-4">Media</h2>

                                {/* Main Media Display */}
                                <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.05}>
                                    <div className="mb-4 rounded-xl overflow-hidden bg-black/20 border border-white/5">

                                        {/* AnimatePresence відстежує зміни "дітей" всередині */}
                                        {/* mode="wait" - чекає, поки стара картинка зникне, перед тим як показати нову */}
                                        <AnimatePresence mode="wait">
                                            {selectedMedia?.type === 'image' ? (
                                                <motion.img
                                                    // Ключ - це те, як AnimatePresence розуміє, що елемент змінився
                                                    key={selectedMedia.url}
                                                    src={selectedMedia.url}
                                                    alt="Project media"
                                                    className="w-full h-auto max-h-[500px] object-contain"
                                                    // Розгортаємо наші налаштування анімації
                                                    {...fadeTransition}
                                                />
                                            ) : selectedMedia?.type === 'video' ? (
                                                <motion.video
                                                    key={selectedMedia.url} // Той самий ключ
                                                    src={selectedMedia.url}
                                                    controls
                                                    className="w-full h-auto max-h-[500px]"
                                                    // І та сама анімація
                                                    {...fadeTransition}
                                                />
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                </MotionEffect>
                                {/* Thumbnail Gallery */}
                                <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.05}>
                                {projectData.media.length > 1 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {projectData.media.map((media) => (
                                            <div
                                                key={media.id}
                                                onClick={() => setSelectedMedia(media)}
                                                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                                                    selectedMedia?.id === media.id
                                                        ? 'border-[#8b5cf6] ring-2 ring-[#8b5cf6]/50'
                                                        : 'border-white/10 hover:border-[#8b5cf6]/50'
                                                }`}
                                            >
                                                {media.type === 'image' ? (
                                                    <img
                                                        src={media.url}
                                                        alt="Thumbnail"
                                                        className="w-full h-full aspect-square object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full aspect-square bg-black/40 flex items-center justify-center">
                                                        <Video className="w-6 h-6 text-white/60" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </MotionEffect>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <h2 className="text-2xl text-white mb-4">About this project</h2>
                            <div
                                className="text-gray-300 prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: renderMarkdown(projectData.description),
                                }}
                            />
                        </div>

                        {/* Technologies */}
                        {projectData.technologies.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <Code className="w-5 h-5 text-[#8b5cf6]" />
                                    <h2 className="text-white">Tech Stack</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {projectData.technologies.map((tech) => (
                                        <Badge
                                            key={tech.id}
                                            className="bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] border border-[#8b5cf6]/30 px-4 py-1.5 text-sm transition-all duration-300"
                                        >
                                            {tech.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Author */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-[#8b5cf6]" />
                                <h3 className="text-white">Author</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12 border-2 border-[#8b5cf6]/50 cursor-pointer" onClick={handleNavigate(`/profile/${projectData.author.username}`)}>
                                    <AvatarImage src={projectData.author.avatarUrl} alt={projectData.author.username} />
                                    <AvatarFallback className="bg-[#8b5cf6]/20 text-[#8b5cf6]">
                                        {projectData.author.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white truncate">{projectData.author.username}</p>
                                    <p className="text-sm text-gray-400 truncate">{projectData.author.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Collaborators */}
                        {projectData.subauthors.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-white mb-4">Collaborators</h3>
                                <div className="space-y-3">
                                    {projectData.subauthors.map((collaborator) => (
                                        <div key={collaborator.id} className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border border-white/10">
                                                <AvatarImage
                                                    src={collaborator.avatarUrl}
                                                    alt={collaborator.username}
                                                />
                                                <AvatarFallback className="bg-white/10 text-white text-xs">
                                                    {collaborator.username.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{collaborator.username}</p>
                                                <p className="text-xs text-gray-400 truncate">{collaborator.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Project Info */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <h3 className="text-white mb-4">Project Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Status</span>
                                    <Badge
                                        className={`${
                                            projectData.status === 'DRAFT'
                                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                                        } border`}
                                    >
                                        {projectData.status}
                                    </Badge>
                                </div>
                                <Separator className="bg-white/10 h-[1px]" />
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Created</span>
                                    <span className="text-white">
                                        {new Date(projectData.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Updated</span>
                                    <span className="text-white">
                                        {new Date(projectData.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <Separator className="bg-white/10 h-[1px]" />
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Team size</span>
                                    <span className="text-white">
                                        {1 + projectData.subauthors.length} member{projectData.subauthors.length > 0 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-purple-900/20 backdrop-blur-xl rounded-2xl border border-[#8b5cf6]/30 p-6 shadow-2xl">
                            <h3 className="text-white mb-4">Quick Actions</h3>
                            {apiError && (
                                <div className="mb-4">
                                    <ErrorMessage
                                        message={apiError}
                                        type="error"
                                        onDismiss={() => setApiError(null)} // Дозволяє користувачу закрити помилку
                                        fullScreen={false} // Як ви і просили, не на повний екран
                                    />
                                </div>
                            )}
                            <div className="space-y-3">
                                <Button
                                    variant={`${isLiked ? 'ghost' : 'primary'}`}
                                    onClick={handleLike}
                                    disabled={isLiking||currentUserId === undefined}
                                    className={`w-full flex items-center justify-center ${
                                        isLiked
                                            ? 'rounded-full'
                                            : 'rounded-full'
                                    } text-white transition-all duration-300`}
                                >
                                    <Heart className={`w-6 h-6 mr-2  ${isLiked ? 'fill-current' : ''}`} />
                                    {isLiking ? 'Loading...' : isLiked ? 'Liked' : 'Like'}
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    className="w-full flex items-center justify-center">
                                    <Share className={`w-6 h-6 mr-2`}/>
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}