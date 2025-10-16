import { useNavigate, useParams } from 'react-router-dom';

import Loading from '../../../components/Loading.tsx';
import ErrorMessage from '../../../components/ErrorMessage.tsx';
import { useGetUserProfileQuery } from '../api/userApi.ts';
import type { Project } from '../../../shared/types/Project.ts';
import Button from "../../../components/Button.tsx";
import {MotionEffect} from "../../../components/Animations/Motion/Motion-effect.tsx";
import UserProfileTabs from "../../../components/UserProfileTabs.tsx";
import ProjectCard from "../../../components/ProjectCard.tsx";


// Компонент для відображення картки з даними
const StatCard = ({ title, value }: { title: string; value: number | string }) => (
    <div className="flex flex-col items-center bg-gray-800/50 p-4 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-xl font-bold">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
    </div>
);

// Компонент для відображення тегів
const Tag = ({ text }: { text: string }) => (
    <span className="bg-purple-500/20 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full hover:bg-purple-500/30 transition hover:scale-[1.2] ">
        {text}
    </span>
);

const UserProfile = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const profileTabs = ['Projects', 'Activity', 'About'];
    const { data: user, isLoading, isError } = useGetUserProfileQuery(username || '');
    console.log('Fetching profile for username:', user);
    if (isLoading) {
        return <Loading message="Завантаження профілю..." />;
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
                <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-pink-500/10 rounded-full blur-3xl" />

                <ErrorMessage defaultMessage="Користувача не знайдено або виникла помилка." />
                <Button className="mt-4" onClick={() => navigate(-1)}>Повернутись назад</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-screen bg-background text-foreground relative overflow-hidden flex justify-center p-4">
            {/* Анімований фон */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 size-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-pink-500/10 rounded-full blur-3xl" />
            <MotionEffect slide={{ direction: 'down' }} fade zoom inView delay={0.05}>

            <div className="w-full max-w-4xl relative z-10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm bg-gray-900/40 border border-white/10 shadow-xl mt-24">
                {/* Верхня секція профілю */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <img
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt={`${user.username} avatar`}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-500/50 shadow-lg"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold">{user.username}</h1>
                        <p className="text-gray-400 text-sm sm:text-base">@{user.username}</p>
                        <p className="mt-4 text-gray-300 max-w-lg mx-auto md:mx-0">
                            {user.bio || "Full stack developer passionate about building innovative solutions. Love hackathons, open source, and creating impactful tech."}
                        </p>
                    </div>
                    {/* Статистика в ряд */}
                    <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
                        <StatCard title="Followers" value={user.followersCount} />
                        <StatCard title="Following" value={user.followingCount} />
                        <StatCard title="Projects" value={user.projectsCount} />
                        <StatCard title="Hackathons" value={"15"} /> {/* Приклад, якщо немає в API */}
                    </div>
                </div>

                {/* Соціальні лінки та інформація */}
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-8">
                    <span>
                        <i className="fas fa-envelope mr-2"></i> {user.email}
                    </span>
                    <span>
                        <i className="fas fa-map-marker-alt mr-2"></i> San Francisco, CA
                    </span>
                    {user.socialLinks && user.socialLinks.map((link) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                            <i className={`fab fa-${link.provider} text-xl hover:text-white transition-colors`}></i>
                        </a>
                    ))}
                    <span>
                        <i className="fas fa-calendar-alt mr-2"></i> Joined {new Date(user.createdAt).getFullYear()}
                    </span>
                </div>

                {/* Секція навичок */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Tag text="React" />
                    <Tag text="Node.js" />
                    <Tag text="TypeScript" />
                    <Tag text="Python" />
                    <Tag text="AI/ML" />
                    <Tag text="Web3" />
                </div>

                {/* Секція "картки" зі статистикою */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Winner" value={"5"} />
                    <StatCard title="Projects" value={user.projectsCount} />
                    <StatCard title="Collaborations" value={"42"} />
                </div>
                <div className="mb-8 w-auto">
                    <UserProfileTabs tabs={profileTabs} />
                </div>
                {/* Секція проектів */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Проекти</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {user.projects.length > 0 ? (
                            user.projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))
                        ) : (
                            <p className="text-gray-500">Користувач ще не додав жодного проекту.</p>
                        )}
                    </div>
                </div>


            </div>
            </MotionEffect>
        </div>
    );
};

export default UserProfile;