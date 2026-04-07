"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { HiOutlineKey, HiOutlineCalendar, HiOutlineExternalLink, HiOutlineClipboardCopy, HiOutlineCheck } from "react-icons/hi";

interface Project {
    _id: string;
    name: string;
    publicKey: string;
    secretKey?: string;
    createdAt?: string;
}

const CopyButton = ({ value, label }: { value?: string; label: string }) => {
    const [copied, setCopied] = useState(false);

    if (!value) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center space-x-2 bg-sidebar-accent/50 px-3 py-1.5 rounded-lg w-fit border border-sidebar-border/50 hover:bg-sidebar-accent transition-all group cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
            title={`Copy ${label}`}
        >
            <HiOutlineKey size={14} className="text-primary/50 group-hover:text-primary transition-colors" />
            <span className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                {label === "Secret Key" ? "••••••••••••••••" : `${value.substring(0, 10)}...${value.slice(-4)}`}
            </span>
            <div className="ml-1 text-primary/40 group-hover:text-primary transition-colors">
                {copied ? <HiOutlineCheck size={14} /> : <HiOutlineClipboardCopy size={14} />}
            </div>
        </button>
    );
};

export function ProjectListTable({ projects, isLoading }: { projects: Project[]; isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="w-full py-20 text-center bg-sidebar/30 border border-sidebar-border rounded-3xl border-dashed">
                <div className="w-16 h-16 bg-sidebar-accent/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sidebar-foreground/30">
                    <HiOutlineKey size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">No projects yet</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                    Create your first project to start integrating Authiq into your applications.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-sidebar border border-sidebar-border rounded-3xl overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-sidebar-accent/50">
                    <TableRow className="hover:bg-transparent border-sidebar-border/50">
                        <TableHead className="font-bold text-foreground py-4 px-6">Project Name</TableHead>
                        <TableHead className="font-bold text-foreground py-4 px-6">Public Key</TableHead>
                        <TableHead className="font-bold text-foreground py-4 px-6">Secret Key</TableHead>
                        <TableHead className="font-bold text-foreground py-4 px-6">Created At</TableHead>
                        <TableHead className="text-right py-4 px-6"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project._id} className="hover:bg-sidebar-accent/30 border-sidebar-border/50 transition-colors group">
                            <TableCell className="py-5 px-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-sm">
                                        {project.name?.[0].toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-foreground">{project.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-5 px-6">
                                <CopyButton value={project.publicKey} label="Public Key" />
                            </TableCell>
                            <TableCell className="py-5 px-6">
                                <CopyButton value={project.secretKey} label="Secret Key" />
                            </TableCell>
                            <TableCell className="py-5 px-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                    <HiOutlineCalendar size={16} className="text-sidebar-foreground/30" />
                                    <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-5 px-6 text-right">
                                <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                                    <HiOutlineExternalLink size={20} />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
