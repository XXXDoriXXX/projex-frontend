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