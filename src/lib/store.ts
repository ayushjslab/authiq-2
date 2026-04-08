import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ALL_PROVIDERS = [
    "google",
    "facebook",
    "github",
    "twitter",
    "linkedin",
    "discord",
    "reddit",
    "spotify",
    "twitch",
    "yahoo",
    "dropbox",
    "slack",
    "gitlab",
    "stackoverflow",
    "notion"
] as const;
export type SocialProvider = (typeof ALL_PROVIDERS)[number];
export type Plan = "free" | "pro";

export interface Project {
    _id: string;
    name: string;
    publicKey: string;
    secretKey?: string;
    plan: Plan;
    settings: {
        allowedOrigins: string[];
        redirectUrls: string[];
        enabledProviders: SocialProvider[];
        maxUsers: number;
        tokenExpiryTime: number;
    };
    createdAt?: string;
}

interface ProjectState {
    selectedProject: Project | null;
    setSelectedProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            selectedProject: null,
            setSelectedProject: (project) => set({ selectedProject: project }),
        }),
        {
            name: 'project-storage',
        }
    )
);
