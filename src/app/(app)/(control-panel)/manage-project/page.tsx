"use client";

import { useState, useEffect } from "react";
import { useProjectStore, ALL_PROVIDERS, SocialProvider } from "@/lib/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { Users, Shield, Zap, Lock, Crown, Info, Check, Minus, Plus } from "lucide-react";

const PROVIDER_META: Record<SocialProvider, { label: string; logo: string; darkInvert?: boolean }> = {
    google: { label: "Google", logo: "/google.svg" },
    microsoft: { label: "Email", logo: "/email.svg", darkInvert: true },
    facebook: { label: "Facebook", logo: "/facebook.svg" },
    github: { label: "GitHub", logo: "/github.svg", darkInvert: true },
    linkedin: { label: "LinkedIn", logo: "/linkedin.svg" },
    twitter: { label: "X (Twitter)", logo: "/x.svg", darkInvert: true },
    discord: { label: "Discord", logo: "/discord.svg" },
    slack: { label: "Slack", logo: "/slack.svg" },
    gitlab: { label: "GitLab", logo: "/gitlab.svg" },
    notion: { label: "Notion", logo: "/notion.svg", darkInvert: true },
};


const FREE_PLAN_MAX_PROVIDERS = 3;
const FREE_PLAN_MAX_USERS = 1000;

async function updateProjectSettings(data: {
    projectId: string;
    enabledProviders: SocialProvider[];
    maxUsers: number;
}) {
    const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update project");
    return json;
}

export default function ManageProjectPage() {
    const { selectedProject } = useProjectStore();
    const queryClient = useQueryClient();

    const [enabledProviders, setEnabledProviders] = useState<SocialProvider[]>([]);
    const [maxUsers, setMaxUsers] = useState(1000);
    const [isDirty, setIsDirty] = useState(false);

    const plan = selectedProject?.plan ?? "free";
    const isFree = plan === "free";
    const maxProviders = isFree ? FREE_PLAN_MAX_PROVIDERS : ALL_PROVIDERS.length;

    useEffect(() => {
        if (selectedProject) {
            setEnabledProviders(selectedProject.settings?.enabledProviders ?? []);
            setMaxUsers(selectedProject.settings?.maxUsers ?? 1000);
            setIsDirty(false);
        }
    }, [selectedProject]);

    const { mutate: saveSettings, isPending } = useMutation({
        mutationFn: updateProjectSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project settings saved!");
            setIsDirty(false);
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });

    const toggleProvider = (provider: SocialProvider) => {
        if (enabledProviders.includes(provider)) {
            setEnabledProviders(enabledProviders.filter(p => p !== provider));
            setIsDirty(true);
        } else {
            if (enabledProviders.length >= maxProviders) {
                toast.error(isFree
                    ? `Free plan allows only ${FREE_PLAN_MAX_PROVIDERS} providers. Upgrade to Pro for more.`
                    : "Maximum providers reached.");
                return;
            }
            setEnabledProviders([...enabledProviders, provider]);
            setIsDirty(true);
        }
    };

    const adjustUsers = (delta: number) => {
        setMaxUsers(u => Math.min(FREE_PLAN_MAX_USERS, Math.max(0, u + delta)));
        setIsDirty(true);
    };

    const handleUserInput = (val: string) => {
        const n = Math.min(FREE_PLAN_MAX_USERS, Math.max(0, Number(val) || 0));
        setMaxUsers(n);
        setIsDirty(true);
    };

    const handleSave = () => {
        if (!selectedProject) return;
        saveSettings({ projectId: selectedProject._id, enabledProviders, maxUsers });
    };

    if (!selectedProject) {
        return (
            <div className="flex items-center justify-center h-full min-h-64">
                <p className="text-muted-foreground text-sm">Select a project to manage its settings.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure authentication providers and usage limits.</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${isFree ? "bg-zinc-800 text-zinc-300" : "bg-amber-500/20 text-amber-400"}`}>
                    {!isFree && <Crown size={12} />}
                    {plan.toUpperCase()}
                </span>
            </div>

            {/* Free plan banner */}
            {isFree && (
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <Info size={16} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-300">
                        <span className="font-semibold">Free Plan: </span>
                        Up to <strong>{FREE_PLAN_MAX_PROVIDERS} providers</strong> and <strong>{FREE_PLAN_MAX_USERS.toLocaleString()} users/month</strong>.{" "}
                        <button className="underline font-medium text-amber-200 hover:text-white transition-colors">Upgrade to Pro</button> for unlimited.
                    </p>
                </div>
            )}

            {/* Providers Grid */}
            <section className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-primary" />
                        <h2 className="font-semibold text-base">Authentication Providers</h2>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {enabledProviders.length} / {maxProviders} enabled
                    </span>
                </div>
                <div className="p-5 grid grid-cols-5 gap-3">
                    {(ALL_PROVIDERS as readonly SocialProvider[]).map((provider) => {
                        const meta = PROVIDER_META[provider];
                        const isEnabled = enabledProviders.includes(provider);
                        const isLocked = isFree && !isEnabled && enabledProviders.length >= maxProviders;

                        return (
                            <button
                                key={provider}
                                onClick={() => !isLocked && toggleProvider(provider)}
                                disabled={isLocked}
                                title={isLocked ? "Upgrade to Pro to add more providers" : meta.label}
                                className={`
                                    relative flex flex-col items-center justify-center gap-2.5
                                    aspect-square rounded-xl border-2 p-3 transition-all duration-200 group
                                    ${isEnabled
                                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                                        : isLocked
                                            ? "border-border bg-card opacity-40 cursor-not-allowed"
                                            : "border-border bg-card hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                                    }
                                `}
                            >
                                {/* Enabled checkmark */}
                                {isEnabled && (
                                    <span className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                                        <Check size={9} className="text-primary-foreground" />
                                    </span>
                                )}
                                {/* Locked icon */}
                                {isLocked && (
                                    <span className="absolute top-2 right-2">
                                        <Lock size={10} className="text-muted-foreground" />
                                    </span>
                                )}
                                <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={meta.logo}
                                        alt={meta.label}
                                        width={50}
                                        height={50}
                                        className={meta.darkInvert ? "dark:invert" : ""}
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-center leading-tight">{meta.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* User Limit */}
            <section className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    <h2 className="font-semibold text-base">Monthly User Limit</h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">Max sign-ins per month</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Set between 0 and {FREE_PLAN_MAX_USERS.toLocaleString()} on the free plan.
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                            <button
                                onClick={() => adjustUsers(-100)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Minus size={14} />
                            </button>
                            <input
                                type="number"
                                value={maxUsers}
                                onChange={(e) => handleUserInput(e.target.value)}
                                className="w-20 text-center text-sm font-mono font-semibold bg-transparent border-none focus:outline-none"
                                min={0}
                                max={FREE_PLAN_MAX_USERS}
                            />
                            <button
                                onClick={() => adjustUsers(100)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Limit set</span>
                            <span className="tabular-nums">{maxUsers.toLocaleString()} / {FREE_PLAN_MAX_USERS.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${(maxUsers / FREE_PLAN_MAX_USERS) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap size={15} />
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}