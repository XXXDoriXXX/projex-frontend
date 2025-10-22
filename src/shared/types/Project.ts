export interface Project {
    id: string;
    title: string;
    description: string;
    previewUrl: string | null;
    githubUrl: string | null;
    demoUrl: string | null;
    likesCount: number;
    sharesCount: number;
    tags: string[];
}

export interface Author {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
}

export interface ProjectMedia {
    id: string;
    type: 'image' | 'video';
    url: string;
    status: string;
    createdAt: string;
}

export interface ProjectTechnology {
    id: string;
    name: string;
}
export interface DetailedProject {
    id: string;
    title: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    previewUrl: string | null;
    status: string;
    createdAt: string;
    userId: string;

    media: ProjectMedia[];
    technologies: ProjectTechnology[];
    author: Author;
    subauthors: Author[];

    likesCount: number;
    viewsCount: number;
    isLiked: boolean;
}

export interface ProjectDetailsResponse {
    success: boolean;
    data: DetailedProject;
    message: string;
}