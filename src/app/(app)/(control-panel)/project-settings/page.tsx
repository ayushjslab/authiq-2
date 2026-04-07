"use client";

import { useState, useEffect } from "react";
import { useProjectStore } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    HiOutlineSave,
    HiOutlineKey,
    HiOutlineGlobeAlt,
    HiOutlineLink,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineRefresh,
    HiOutlineShieldCheck,
    HiOutlineExclamation
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProjectSettingsPage() {
    const { selectedProject, setSelectedProject } = useProjectStore();
    const queryClient = useQueryClient();

    // Local state for form fields
    const [name, setName] = useState(selectedProject?.name || "");
    const [origins, setOrigins] = useState<string[]>(selectedProject?.settings?.allowedOrigins || []);
    const [redirects, setRedirects] = useState<string[]>(selectedProject?.settings?.redirectUrls || []);

    const [newOrigin, setNewOrigin] = useState("");
    const [newRedirect, setNewRedirect] = useState("");

    // Sync local state when selectedProject changes
    useEffect(() => {
        if (selectedProject) {
            setName(selectedProject.name);
            setOrigins(selectedProject.settings?.allowedOrigins || []);
            setRedirects(selectedProject.settings?.redirectUrls || []);
        }
    }, [selectedProject]);

    const mutation = useMutation({
        mutationFn: async (updates: any) => {
            const res = await fetch("/api/projects", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProject?._id,
                    ...updates
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update settings");
            }
            return res.json();
        },
        onSuccess: (data) => {
            setSelectedProject(data);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success("Settings updated successfully");
        },
        onError: (err: any) => {
            toast.error(err.message || "Something went wrong");
        }
    });

    const handleSaveGeneral = () => {
        if (!name.trim()) return toast.error("Project name is required");
        mutation.mutate({ name });
    };

    const addOrigin = () => {
        if (!newOrigin) return;
        // if (!newOrigin.startsWith("https://")) return toast.error("Origins must start with https://");
        if (origins.includes(newOrigin)) return toast.error("Origin already exists");

        const updated = [...origins, newOrigin];
        setOrigins(updated);
        mutation.mutate({ allowedOrigins: updated });
        setNewOrigin("");
    };

    const removeOrigin = (idx: number) => {
        const updated = origins.filter((_, i) => i !== idx);
        setOrigins(updated);
        mutation.mutate({ allowedOrigins: updated });
    };

    const addRedirect = () => {
        if (!newRedirect) return;
        if (redirects.includes(newRedirect)) return toast.error("Redirect URL already exists");

        const updated = [...redirects, newRedirect];
        setRedirects(updated);
        mutation.mutate({ redirectUrls: updated });
        setNewRedirect("");
    };

    const removeRedirect = (idx: number) => {
        const updated = redirects.filter((_, i) => i !== idx);
        setRedirects(updated);
        mutation.mutate({ redirectUrls: updated });
    };

    const handleRegenerateKeys = () => {
        mutation.mutate({ regenerateKeys: true });
    };

    if (!selectedProject) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <HiOutlineShieldCheck size={64} className="text-muted-foreground/20" />
                <h2 className="text-xl font-bold text-muted-foreground text-center">
                    No Project Selected<br />
                    <span className="text-sm font-normal">Please select a project from the navbar to view settings.</span>
                </h2>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Project <span className="text-primary font-heading">Settings</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                    Manage your project configuration, security policies, and integration credentials. Changes are applied in real-time.
                </p>
            </div>

            {/* General Settings */}
            <div className="bg-sidebar/50 border border-sidebar-border rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-sm transition-all hover:border-primary/20">
                <div className="flex items-center space-x-3 text-primary mb-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <HiOutlineGlobeAlt size={22} className="stroke-2" />
                    </div>
                    <h2 className="text-xl font-bold">General Information</h2>
                </div>

                <div className="space-y-5 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="projectName" className="font-bold ml-1 text-foreground/70">Project Name</Label>
                        <Input
                            id="projectName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-sidebar-accent/30 border-sidebar-border focus:ring-primary/20 rounded-xl h-12"
                            placeholder="My Awesome App"
                        />
                    </div>
                    <Button
                        onClick={handleSaveGeneral}
                        disabled={mutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl px-6 py-5 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <HiOutlineSave className="mr-2 stroke-2" />
                        {mutation.isPending ? "Updating..." : "Save Name"}
                    </Button>
                </div>
            </div>

            {/* Security Settings (Origins) */}
            <div className="bg-sidebar/50 border border-sidebar-border rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-sm transition-all hover:border-primary/20">
                <div className="flex items-center space-x-3 text-primary mb-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <HiOutlineShieldCheck size={22} className="stroke-2" />
                    </div>
                    <h2 className="text-xl font-bold">Security & Whitelisting</h2>
                </div>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    Whitelist domains that are allowed to make requests to Authiq. All origins <span className="text-foreground font-bold">MUST</span> use HTTPS for security.
                </p>

                <div className="space-y-6">
                    <div className="flex items-center space-x-2 max-w-md">
                        <Input
                            placeholder="https://example.com"
                            value={newOrigin}
                            onChange={(e) => setNewOrigin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addOrigin()}
                            className="bg-sidebar-accent/30 border-sidebar-border rounded-xl h-11"
                        />
                        <Button onClick={addOrigin} variant="secondary" className="font-bold rounded-xl h-11 px-6">
                            <HiOutlinePlus className="mr-2" /> Add
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {origins.length > 0 ? (
                            origins.map((origin, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 bg-sidebar-accent/20 border border-sidebar-border/50 rounded-2xl group hover:border-primary/30 transition-all">
                                    <span className="text-xs font-mono truncate text-foreground/80">{origin}</span>
                                    <button
                                        onClick={() => removeOrigin(idx)}
                                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 bg-sidebar/50 rounded-lg"
                                    >
                                        <HiOutlineTrash size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-6 text-center border border-dashed border-sidebar-border rounded-2xl text-muted-foreground text-sm italic">
                                No origins whitelisted yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Redirect URLs */}
            <div className="bg-sidebar/50 border border-sidebar-border rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-sm transition-all hover:border-primary/20">
                <div className="flex items-center space-x-3 text-primary mb-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <HiOutlineLink size={22} className="stroke-2" />
                    </div>
                    <h2 className="text-xl font-bold">Redirection Rules</h2>
                </div>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    Define authorized callback URLs where users can be redirected after successful authentication.
                </p>

                <div className="space-y-6">
                    <div className="flex items-center space-x-2 max-w-md">
                        <Input
                            placeholder="https://app.example.com/callback"
                            value={newRedirect}
                            onChange={(e) => setNewRedirect(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addRedirect()}
                            className="bg-sidebar-accent/30 border-sidebar-border rounded-xl h-11"
                        />
                        <Button onClick={addRedirect} variant="secondary" className="font-bold rounded-xl h-11 px-6">
                            <HiOutlinePlus className="mr-2" /> Add
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {redirects.length > 0 ? (
                            redirects.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 bg-sidebar-accent/20 border border-sidebar-border/50 rounded-2xl group hover:border-primary/30 transition-all">
                                    <span className="text-xs font-mono truncate text-foreground/80">{url}</span>
                                    <button
                                        onClick={() => removeRedirect(idx)}
                                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 bg-sidebar/50 rounded-lg"
                                    >
                                        <HiOutlineTrash size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-6 text-center border border-dashed border-sidebar-border rounded-2xl text-muted-foreground text-sm italic">
                                No redirect URLs defined yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* API Credentials */}
            <div className="bg-sidebar/50 border border-sidebar-border rounded-3xl p-8 space-y-7 backdrop-blur-md shadow-sm border-l-4 border-l-destructive/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-primary">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <HiOutlineKey size={22} className="stroke-2" />
                        </div>
                        <h2 className="text-xl font-bold">API Credentials</h2>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="font-black text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-xl px-4 h-10 transition-all cursor-pointer"
                            >
                                <HiOutlineRefresh className="mr-2 stroke-2" /> Regenerate Keys
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-sidebar border-sidebar-border rounded-3xl p-8">
                            <AlertDialogHeader className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                                    <HiOutlineExclamation size={24} className="stroke-2" />
                                </div>
                                <div>
                                    <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground">Regenerate API Keys?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground mt-2 leading-relaxed">
                                        This action will <span className="text-foreground font-bold">immediately invalidate</span> your current public and secret keys. All integrations using the old keys will stop working until updated.
                                    </AlertDialogDescription>
                                </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-3">
                                <AlertDialogCancel className="rounded-xl font-bold border-sidebar-border hover:bg-sidebar-accent transition-all flex-1 h-12 cursor-pointer">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRegenerateKeys}
                                    className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all flex-1 h-12 shadow-lg shadow-destructive/20 cursor-pointer"
                                >
                                    Yes, Regenerate
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <Label className="font-black ml-1 text-[10px] uppercase tracking-[0.2em] text-foreground/40">Public Access Key</Label>
                        <div className="flex items-center p-4 bg-sidebar-accent/30 border border-sidebar-border rounded-2xl font-mono text-sm group transition-all hover:border-primary/30">
                            <span className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide text-foreground/70">{selectedProject.publicKey}</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <Label className="font-black ml-1 text-[10px] uppercase tracking-[0.2em] text-foreground/40">Private Secret Key</Label>
                        <div className="flex items-center p-4 bg-sidebar-accent/30 border border-sidebar-border rounded-2xl font-mono text-sm group transition-all hover:border-primary/30">
                            <span className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide text-foreground/70 tracking-widest leading-none">••••••••••••••••••••••••••••••••</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-destructive/5 border border-destructive/10 rounded-2xl text-[11px] text-destructive leading-relaxed flex items-start space-x-3">
                    <HiOutlineRefresh size={18} className="shrink-0 mt-0.5 opacity-70" />
                    <div className="space-y-1">
                        <p className="font-bold uppercase tracking-wider">Danger Zone Notice</p>
                        <p>Regenerating your API keys will <span className="font-black underline">immediately invalidate</span> all existing integrations. Your applications will stop accepting credentials until you update them with the new keys.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}