import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import { logout } from '../../../features/auth/authSlice';
import { LogOut, UserPlus, UserCheck, Loader2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import Loading from '../../../components/Loading.tsx';
import ErrorMessage from '../../../components/ErrorMessage.tsx';
import { useGetUserProfileQuery, useFollowUserMutation, useUnfollowUserMutation, useGetIsUserFollowedQuery } from '../api/userApi.ts';
import Button from "../../../components/Button.tsx";
import ProjectCard from "../../../components/ProjectCard.tsx";
import UserListModal from "../components/UserListModal.tsx";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const StatCard = ({ title, value, onClick }: { title: string; value: number | string; onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center bg-gray-800/50 p-4 rounded-2xl border border-white/10 shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105 hover:bg-gray-800/80 hover:border-primary/30' : 'hover:scale-105'}`}
    >
        <h3 className="text-xl font-bold">{value}</h3>
        <p className="text-sm text-gray-400 text-center">{title}</p>
    </div>
);

const Tag = ({ text }: { text: string }) => (
    <span className="bg-purple-500/20 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full hover:bg-purple-500/30 transition hover:scale-[1.2] ">
        {text}
    </span>
);

const UserProfile = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector((state: RootState) => state.auth.user);
    const isCurrentUserProfile = currentUser?.username === username;

    const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);

    const { data: user, isLoading, isError } = useGetUserProfileQuery(username || '');

    const { data: followStatus, isLoading: isStatusLoading } = useGetIsUserFollowedQuery(user?.id || '', {
        skip: !user?.id || isCurrentUserProfile
    });

    const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation();
    const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation();

    const isFollowing = followStatus?.isFollowing;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth/login');
    };

    const handleFollowToggle = async () => {
        if (!user?.id) return;
        if (!currentUser) {
            toast.error("Увійдіть, щоб підписатися");
            navigate('/auth/login');
            return;
        }
        try {
            if (isFollowing) {
                await unfollowUser(user.id).unwrap();
                toast.success(`Ви відписалися від ${user.username}`);
            } else {
                await followUser(user.id).unwrap();
                toast.success(`Ви підписалися на ${user.username}`);
            }
        } catch (error) {
            toast.error("Щось пішло не так...");
        }
    };

    const handleEditProfile = () => {
        navigate(`/profile/edit/${user?.username}`);
    };

    const handleNavigateProject = (projectId: string) => () => {
        navigate(`/project/view/${projectId}`);
    };


    if (isLoading) {
        return (
            <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
                <Loading text="Завантаження профілю..." />
            </div>
        );
    }
    if (isError || !user) {
        return (
            <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
                <ErrorMessage title={"Not Found"} message="Користувача не знайдено." type={"error"} />
                <Button className="mt-6 z-10" onClick={() => navigate('/')}>На головну</Button>
            </div>
        );
    }

    const uniqueTechnologies = Array.from(new Set(user.projects.flatMap(project => project.technologies.map(tech => tech.name))));
    const socialIcons: Record<string, string> = {
        github: 'fab fa-github', twitter: 'fab fa-twitter', linkedin: 'fab fa-linkedin',
        website: 'fas fa-globe', instagram: 'fab fa-instagram', facebook: 'fab fa-facebook',
    };

    const isActionLoading = isFollowingLoading || isUnfollowingLoading || isStatusLoading;

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden flex justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl opacity-60" />


                <div className="w-full max-w-5xl relative z-10 p-6 sm:p-8 rounded-3xl backdrop-blur-md bg-gray-900/50 border border-white/10 shadow-2xl mt-24 mb-10">

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                        <img src={user.avatarUrl || '/default-avatar.png'} alt={`${user.username} avatar`} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-purple-500/50 shadow-xl" />
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{user.username}</h1>
                                <p className="text-purple-300 text-sm sm:text-base">@{user.username}</p>
                            </div>
                            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
                                {user.bio || "Інформація про користувача відсутня."}
                            </p>


                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                {isCurrentUserProfile ? (
                                    <>
                                        <Button onClick={handleEditProfile} variant="secondary" className="py-2 px-4 text-sm inline-flex items-center gap-2">
                                            <Edit className="size-4" /> Редагувати
                                        </Button>
                                        <Button variant="danger" onClick={handleLogout} className="py-2 px-4 text-sm inline-flex items-center gap-2">
                                            <LogOut className="size-4" /> Вийти
                                        </Button>
                                    </>
                                ) : (

                                    <Button
                                        onClick={handleFollowToggle}
                                        disabled={isActionLoading}
                                        variant={isFollowing ? "secondary" : "primary"}
                                        className={`py-2 px-6 text-sm inline-flex items-center gap-2 transition-all min-w-[140px] justify-center ${isFollowing ? 'hover:bg-destructive/20 hover:text-destructive' : ''}`}
                                    >
                                        {isActionLoading ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : isFollowing ? (
                                            <><UserCheck className="size-4" /> Підписаний</>
                                        ) : (
                                            <><UserPlus className="size-4" /> Підписатися</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard title="Підписники" value={user.followersCount} onClick={() => setActiveModal('followers')} />
                        <StatCard title="Підписки" value={user.followingCount} onClick={() => setActiveModal('following')} />
                        <StatCard title="Проекти" value={user.projectsCount} />
                        <StatCard title="Хакатони" value={user.participatedHackathonsCount} />
                    </motion.div>


                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 text-sm mb-8 bg-white/5 p-4 rounded-xl">
                        {user.email && <span className="flex items-center gap-2"><i className="fas fa-envelope"></i> {user.email}</span>}
                        <span className="flex items-center gap-2"><i className="fas fa-calendar-alt"></i> Приєднався {new Date(user.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3 ml-auto">
                            {user.socialLinks?.map((link) => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className='text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-white/10 rounded-full'>
                                    <i className={`${socialIcons[link.platform.toLowerCase()] || 'fas fa-link'} text-lg`}></i>
                                </a>
                            ))}
                        </div>
                    </motion.div>


                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-2 mb-10 justify-center md:justify-start">
                        {uniqueTechnologies.length > 0 ? uniqueTechnologies.map(tech => <Tag key={tech} text={tech} />) : <span className="text-gray-500 text-sm italic">Технології ще не вказані.</span>}
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                        <StatCard title="Автор Хакатонів" value={user.authoredHackathonsCount} />
                        <StatCard title="Співавтор Проектів" value={user.subauthoredProjectsCount} />
                    </div>

                    <div className="mb-8">
                        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
                            <span className="bg-purple-500 w-2 h-8 rounded-full inline-block"></span> Проекти
                        </motion.h2>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.projects.length > 0 ? (
                                user.projects.map((project) => (
                                    <motion.div key={project.id} variants={itemVariants}>
                                        <ProjectCard onClick={handleNavigateProject(project.id)} project={project} />
                                    </motion.div>
                                ))
                            ) : (
                                <motion.p variants={itemVariants} className="text-gray-500 text-center col-span-full py-10 bg-white/5 rounded-2xl">
                                    Користувач ще не додав жодного проекту.
                                </motion.p>
                            )}
                        </motion.div>
                    </div>
                </div>

            {user?.id && (
                <UserListModal
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    userId={user.id}
                    type={activeModal || 'followers'}
                />
            )}
        </div>
    );
};

export default UserProfile;