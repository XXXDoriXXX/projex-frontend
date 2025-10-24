// src/components/ProjectPreview.tsx (Обов'язковий допоміжний файл)

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Eye, Heart, Code2, Users, Video } from 'lucide-react';
import { Separator } from './separator';

interface PreviewProps {
    data: any;
    renderMarkdown: (text: string) => string;
}

const ProjectPreview: React.FC<PreviewProps> = ({ data, renderMarkdown }) => {
    const mainMedia = data.media?.find((f: any) => f.isMain);
    const collaboratorCount = data.collaborators.length;

    return (
        <div className="lg:sticky overflow-y-auto lg:top-34 max-h-[calc(100vh-6rem)] overflow-y-auto p-6 bg-gray-800/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl">

            <h1 className="text-2xl font-bold mb-1 text-primary">{data.title || 'Назва проекту'}</h1>
            <p className="text-sm text-gray-400 mb-4">Видимість: {data.visible === 'PRIVATE' ? 'Приватний' : 'Публічний'}</p>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <span className="flex items-center gap-1"><Heart className="size-4 text-red-400" /> 0 Лайків</span>
                <span className="flex items-center gap-1"><Eye className="size-4" /> 0 Переглядів</span>
            </div>

            {mainMedia && (
                <div className="aspect-video mb-6 rounded-xl overflow-hidden border border-white/10">
                    {mainMedia.type === 'image' ? (
                        <img src={mainMedia.url} alt="Прев'ю" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/50"><Video className="size-8 text-white/50" /></div>
                    )}
                </div>
            )}

            <Separator className="my-6 bg-white/10" />

            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><Code2 className="size-5 text-primary" /> Опис</h2>
            <div
                className="text-gray-300 prose prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(data.description || "Тут буде ваш детальний опис проекту...") }}
            />

            {data.technologies.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Технології</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.technologies.map((tech: any) => (
                            <Badge key={tech.id} className="bg-purple-500/20 text-purple-200 border border-purple-500/30">{tech.name}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {collaboratorCount > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Users className="size-5 text-primary" /> Команда</h3>
                    <div className="flex -space-x-2">
                        {data.collaborators.slice(0, 4).map((collab: any) => (
                            <Avatar key={collab.id} className="size-8 border-2 border-gray-800">
                                <AvatarImage src={collab.avatar} alt={collab.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{collab.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        ))}
                        {collaboratorCount > 4 && (
                            <div className="size-8 rounded-full bg-secondary border-2 border-gray-800 flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">+{collaboratorCount - 4}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectPreview;