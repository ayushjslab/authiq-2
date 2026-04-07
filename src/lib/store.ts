import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
    _id: string;
    name: string;
    publicKey: string;
    secretKey?: string;
    settings: {
        allowedOrigins: string[];
        redirectUrls: string[];
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
