"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineChevronDoubleLeft,
    HiOutlineChevronDoubleRight,
    HiOutlineShieldCheck,
    HiX
} from 'react-icons/hi'
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { TbPlugConnected } from "react-icons/tb";
import { PiFolderSimplePlus, PiFolderSimpleStarBold } from "react-icons/pi";
import { TbLayoutDashboard } from "react-icons/tb";
import { useTheme } from 'next-themes'
import { createAuthClient } from "better-auth/react"
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react';
import { RiFolderSettingsLine } from "react-icons/ri";
import { LuFolderCog } from "react-icons/lu";
import { MdOutlineRuleFolder } from "react-icons/md";
import Image from 'next/image';
const authClient = createAuthClient()

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { data: session } = authClient.useSession();
    const pathname = usePathname()
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: TbLayoutDashboard },
        { name: 'Add Project', href: '/add-project', icon: PiFolderSimplePlus },
        { name: 'Project Settings', href: '/project-settings', icon: LuFolderCog },
        { name: 'Manage Project', href: '/manage-project', icon: MdOutlineRuleFolder },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Analytics', href: '/analytics', icon: TbBrandGoogleAnalytics },
        { name: 'Integrations', href: '/integration', icon: TbPlugConnected },
        { name: 'Account Settings', href: '/account-settings', icon: HiOutlineCog },
    ]

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/signin";
    }

    const FooterSection = ({ isMobile }: { isMobile: boolean }) => (
        <div className={cn(
            "p-4 border-t border-sidebar-border mt-auto backdrop-blur-sm",
            !isMobile && "bg-sidebar/50"
        )}>
            {session ? (
                <div className={cn(
                    "flex items-center p-2 rounded-xl border border-transparent transition-all duration-200",
                    isCollapsed && !isMobile ? "justify-center" : "space-x-3 hover:bg-sidebar-accent/50"
                )}>
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent shrink-0 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm overflow-hidden text-center">
                        {session.user.image ? (
                            <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                        ) : (
                            session.user.name?.[0].toUpperCase()
                        )}
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold truncate leading-tight">{session.user.name}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-sidebar-foreground/40 mt-0.5">Pro Plan</p>
                        </div>
                    )}
                    {(!isCollapsed || isMobile) && (
                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-sidebar-foreground/40 hover:text-destructive transition-colors"
                        >
                            <HiOutlineLogout size={20} title="Logout" />
                        </button>
                    )}
                </div>
            ) : (
                <Link
                    href="/signin"
                    className={cn(
                        "flex items-center rounded-xl p-2 transition-all duration-200",
                        isCollapsed && !isMobile ? "justify-center" : "space-x-3 bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                >
                    <div className="w-10 h-10 rounded-xl bg-primary shrink-0 flex items-center justify-center text-primary-foreground font-bold text-lg">
                        ?
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <span className="text-sm font-semibold">Sign In</span>
                    )}
                </Link>
            )}
        </div>
    )

    const sidebarContent = (
        <aside className={cn(
            "h-screen transition-all duration-300 ease-in-out border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col sticky top-0 z-40 overflow-visible",
            isCollapsed ? "w-[80px]" : "w-64",
            "hidden md:flex"
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center p-4 h-20 transition-all duration-300",
                isCollapsed ? "flex-col justify-center gap-2" : "justify-between"
            )}>
                {!isCollapsed && <Link href="/" className="flex items-center space-x-3 group outline-none">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-200 border border-primary/20 relative overflow-hidden">

                        <Image src="/aq.png" alt="Logo" width={35} height={35} className="object-contain relative z-10" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                            Authiq
                        </span>
                    )}
                </Link>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "p-1.5 rounded-lg hover:bg-sidebar-accent transition-all duration-200 border border-transparent active:scale-95 text-sidebar-foreground/50 hover:text-sidebar-foreground",
                        isCollapsed ? "mt-2" : "ml-auto"
                    )}
                >
                    {isCollapsed ? <HiOutlineChevronDoubleRight size={18} /> : <HiOutlineChevronDoubleLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-xl transition-all duration-200 group relative",
                                isCollapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3",
                                isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70 hover:translate-x-1"
                            )}
                        >
                            <item.icon size={isCollapsed ? 24 : 22} className={cn(
                                "shrink-0 transition-transform duration-200",
                                !isActive && "group-hover:scale-110 group-hover:rotate-3"
                            )} />

                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap text-sm">{item.name}</span>
                            )}

                            {isActive && !isCollapsed && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground" />
                            )}

                            {isCollapsed && (
                                <div className="absolute left-[calc(100%+12px)] px-3 py-2 bg-sidebar border border-sidebar-border text-sidebar-foreground text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <FooterSection isMobile={false} />
        </aside>
    )

    const mobileSidebar = (
        <div className={cn(
            "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <aside className={cn(
                "absolute left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-4 h-20 border-b border-sidebar-border">
                    <Link href="/" onClick={onClose} className="flex items-center space-x-3 group outline-none">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-lg border border-primary/20">
                            <Image src="/aq.png" alt="Logo" width={22} height={22} className="object-contain" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300">
                            Authiq
                        </span>
                    </Link>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/50">
                        <HiX size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center rounded-xl p-3 space-x-3 transition-colors",
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                        : "hover:bg-sidebar-accent text-sidebar-foreground/70"
                                )}
                            >
                                <item.icon size={22} className="shrink-0" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <FooterSection isMobile={true} />
            </aside>
        </div>
    )

    return (
        <>
            {sidebarContent}
            {mobileSidebar}
        </>
    )
}

export default Sidebar