
export interface Judge {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface MockTheme {
    id: string;
    name: string;
}

export interface MockRatingCategory {
    id: string;
    name: string;
    order: number;
}

export interface NewRatingCategory {
    name: string;
    order: number;
}

export interface JudgeLookupData {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}

export type HackathonStep = 'basics' | 'schedule' | 'themes' | 'criteria' | 'judges' | 'settings' | 'review';
