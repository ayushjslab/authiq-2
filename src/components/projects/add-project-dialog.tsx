"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HiOutlinePlus } from "react-icons/hi";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AddProjectDialog({ onProjectCreated }: { onProjectCreated?: () => void }) {
    const [name, setName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (projectName: string) => {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: projectName }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create project");
            }
            return res.json();
        },
        onSuccess: () => {
            setName("");
            setIsOpen(false);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            if (onProjectCreated) onProjectCreated();
        },
        onError: (error: any) => {
            toast.error(error.message || "An error occurred. Please try again.");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || mutation.isPending) return;
        mutation.mutate(name);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center space-x-2 px-6 py-6 rounded-2xl font-bold cursor-pointer">
                    <HiOutlinePlus size={20} className="stroke-2" />
                    <span>Create New Project</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-sidebar border-sidebar-border rounded-3xl overflow-hidden p-0 shadow-2xl">
                <div className="p-8">
                    <DialogHeader className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <HiOutlinePlus size={24} className="stroke-2" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Create Project</DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1">
                                Give your new project a name to get started with API management.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-bold text-foreground/70 ml-1">
                                Project Name
                            </label>
                            <input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. My Awesome App"
                                className="w-full bg-sidebar-accent/50 border border-sidebar-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                                required
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="flex sm:justify-between items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-xl hover:bg-sidebar-accent transition-all font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending || !name}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/20 font-bold"
                            >
                                {mutation.isPending ? "Creating..." : "Create Project"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
