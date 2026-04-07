"use client";

import React, { useEffect, useState } from 'react'
import { useProjectStore } from '@/lib/store'
import {
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlinePlus
} from 'react-icons/hi'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) => (
  <div className="bg-sidebar border border-sidebar-border p-6 rounded-3xl hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
        <Icon size={24} className="stroke-2" />
      </div>
      <div className="px-2.5 py-1 rounded-full bg-sidebar-accent text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        This Month
      </div>
    </div>
    <div className="mt-6 space-y-1">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black text-foreground tracking-tight">{value}</h3>
    </div>
  </div>
)

const DashboardPage = () => {
  const { selectedProject } = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!selectedProject) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
          <HiOutlineShieldCheck size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Welcome to Authiq</h1>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Please select or create a project to see your analytics and configuration.
          </p>
        </div>
        <Link
          href="/add-project"
          className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest">Active Project</span>
        </div>
        <h1 className="text-5xl font-black text-foreground tracking-tighter">
          {selectedProject.name} <span className="text-primary font-heading">Insights</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Overview of your project performance and security audit. Track user activity and API performance in real-time.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="1,284"
          icon={HiOutlineUsers}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          title="API Requests"
          value="42.5k"
          icon={HiOutlineLightningBolt}
          color="bg-accent/10 text-accent"
        />
        <StatCard
          title="Avg Response"
          value="124ms"
          icon={HiOutlineClock}
          color="bg-orange-500/10 text-orange-500"
        />
        <StatCard
          title="Security Score"
          value="98/100"
          icon={HiOutlineShieldCheck}
          color="bg-emerald-500/10 text-emerald-500"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-sidebar border border-sidebar-border rounded-4xl p-8 h-96 flex flex-col items-center justify-center border-dashed opacity-60">
          <HiOutlineLightningBolt className="text-primary/20 mb-4" size={48} />
          <p className="text-muted-foreground text-sm font-medium italic">Traffic visualization area coming soon...</p>
        </div>
        <div className="lg:col-span-4 bg-sidebar border border-sidebar-border rounded-4xl p-8 h-96 flex flex-col items-center justify-center border-dashed opacity-60">
          <HiOutlineClock className="text-accent/20 mb-4" size={48} />
          <p className="text-muted-foreground text-sm font-medium italic">Recent activity area coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage