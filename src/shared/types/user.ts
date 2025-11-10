import type {Project} from "./Project.ts";

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    isVerified: boolean;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    projects: Project[];
    socialLinks: any[];
    followersCount: number;
    followingCount: number;
    projectsCount: number;
    createdAt: string;
    authoredHackathonsCount: number;
    participatedHackathonsCount: number;
    subauthoredProjectsCount: number;
}

export interface UserProfileResponse {
    success: boolean;
    data: UserProfile;
    message: string;
}