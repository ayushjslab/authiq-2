"use client";

import React, { useState } from 'react'
import {
    HiOutlineBell,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineSelector,
    HiOutlineMenuAlt2,
    HiOutlineSearch,
    HiOutlineLogout,
    HiOutlineCog
} from 'react-icons/hi'
import { useTheme } from 'next-themes'
import { createAuthClient } from "better-auth/react"
import { cn } from '@/lib/utils'

const authClient = createAuthClient()

interface PanelNavbarProps {
    onMenuClick: () => void;
}

const PanelNavbar = ({ onMenuClick }: PanelNavbarProps) => {
    const { theme, setTheme } = useTheme();
    const { data: session } = authClient.useSession();
    const [selectedProject, setSelectedProject] = useState("Project Authiq");
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/signin";
    }

    return (
        <header className="h-16 border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 md:hidden transition-colors"
                    aria-label="Open Menu"
                >
                    <HiOutlineMenuAlt2 size={24} />
                </button>

                {/* Project Selector */}
                <div className="relative group">
                    <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-sidebar-border hover:bg-sidebar-accent transition-all duration-200 bg-sidebar/50">
                        <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px] md:max-w-[200px]">
                            {selectedProject}
                        </span>
                        <HiOutlineSelector size={14} className="text-sidebar-foreground/40" />
                    </button>

                    {/* Dropdown Placeholder */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-sidebar border border-sidebar-border rounded-xl shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 p-1">
                        <div className="px-3 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">Select Project</div>
                        <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors flex items-center justify-between">
                            Project Authiq
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 transition-colors">
                            Personal API
                        </button>
                        <div className="h-px bg-sidebar-border my-1" />
                        <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-primary/10 text-primary transition-colors font-medium">
                            + Create New Project
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar - Desktop Only */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
                <div className="relative w-full group">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search for APIs, logs..."
                        className="w-full bg-sidebar-accent/50 border border-sidebar-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        <kbd className="px-1.5 py-0.5 rounded border border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/40 font-sans">⌘</kbd>
                        <kbd className="px-1.5 py-0.5 rounded border border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/40 font-sans">K</kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-2">
                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 relative transition-colors group">
                    <HiOutlineBell size={22} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-sidebar" />
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 transition-colors"
                >
                    {mounted && (theme === 'dark' ? <HiOutlineSun size={22} /> : <HiOutlineMoon size={22} />)}
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-sidebar-border mx-2 hidden sm:block" />

                {/* User Section */}
                {mounted && (session ? (
                    <div className="flex items-center space-x-3 pl-2 group relative cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all overflow-hidden">
                            {session.user.image ? (
                                <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                            ) : (
                                session.user.name?.[0].toUpperCase()
                            )}
                        </div>
                        <div className="hidden xl:block">
                            <p className="text-xs font-semibold text-sidebar-foreground leading-tight truncate max-w-[80px]">{session.user.name}</p>
                            <p className="text-[10px] text-sidebar-foreground/40 leading-tight">Pro Plan</p>
                        </div>

                        {/* Session Dropdown */}
                        <div className="absolute top-full right-0 mt-2 w-48 bg-sidebar border border-sidebar-border rounded-xl shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 p-1">
                            <div className="px-3 py-2 border-b border-sidebar-border mb-1">
                                <p className="text-xs font-bold truncate">{session.user.email}</p>
                            </div>
                            <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors flex items-center space-x-2">
                                <HiOutlineCog size={16} />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex items-center space-x-2"
                            >
                                <HiOutlineLogout size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <a
                        href="/signin"
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        Sign In
                    </a>
                ))}
            </div>
        </header>
    )
}

export default PanelNavbar