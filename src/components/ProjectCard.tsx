import React from 'react';
import type {Project} from "../shared/types/Project.ts";

const Tag = ({ text }: { text: string }) => (
    <span className="bg-purple-500/20 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full">
        {text}
    </span>
);

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const tags = project.tags || [];
    return (
        <div className="
            relative rounded-2xl overflow-hidden shadow-lg
            bg-gray-800/50 border border-white/10
            transform transition-all duration-300 hover:scale-105
            group
        ">
            {/* Прев'ю зображення */}
            <div className="relative">
                <img
                    src={project.previewUrl || 'https://via.placeholder.com/600x400.png?text=No+Image'}
                    alt={`Preview of ${project.title}`}
                    className="w-full h-48 object-cover"
                />
                <a
                    href={project.demoUrl || project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                        absolute top-4 right-4 p-2 rounded-full
                        bg-black/40 text-white
                        transition-all duration-300
                        opacity-0 group-hover:opacity-100
                    "
                    aria-label="View Project"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0l-10 10"
                        />
                    </svg>
                </a>
            </div>

            {/* Контент картки */}
            <div className="p-4">
                <h3 className="text-xl font-bold text-purple-400 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Статистика */}
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                    <span className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {project.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M11 3a1 1 0 100 2h2.207l-2.585 2.586a1 1 0 001.414 1.414L15.657 7.414A1 1 0 0017 6v-3a1 1 0 00-1-1h-3a1 1 0 000 2zM3 11a1 1 0 102 0v-2.207l2.586 2.585a1 1 0 101.414-1.414L7.414 4.343A1 1 0 006 3H3a1 1 0 100 2h2.207l-2.585 2.586a1 1 0 101.414 1.414L15.657 7.414A1 1 0 0017 6v-3a1 1 0 00-1-1h-3a1 1 0 000 2z"
                            />
                        </svg>
                        {project.sharesCount}
                    </span>
                </div>

                {/* Теги */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;