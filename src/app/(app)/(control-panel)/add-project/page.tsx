"use client";

import React from "react";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { ProjectListTable } from "@/components/projects/project-list-table";
import { HiOutlineCollection } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/lib/store";

export default function AddProjectPage() {
  const { data: projects = [], isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    }
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-sidebar/50 p-8 rounded-3xl border border-sidebar-border backdrop-blur-md shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-primary">
            <HiOutlineCollection size={24} className="stroke-2" />
            <span className="text-sm font-bold uppercase tracking-widest">Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Project <span className="text-primary font-heading">Dashboard</span>
          </h1>
          <p className="text-muted-foreground max-w-md text-sm md:text-base leading-relaxed">
            Create and manage your authentication projects. Each project comes with unique API keys and dedicated settings.
          </p>
        </div>
        <div className="shrink-0">
          <AddProjectDialog onProjectCreated={() => refetch()} />
        </div>
      </div>

      {/* Projects List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center space-x-3">
            <span className="font-heading">Your Projects</span>
            <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
              {projects.length}
            </div>
          </h2>

          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Refresh List
          </button>
        </div>
        <ProjectListTable projects={projects} isLoading={isLoading} />
      </div>
    </div>
  );
}