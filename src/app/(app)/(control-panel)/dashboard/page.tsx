"use client";

import React, { useEffect, useState } from 'react'
import { useProjectStore } from '@/lib/store'
import {
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineTrendingUp,
  HiOutlineCursorClick,
  HiOutlineUserGroup
} from 'react-icons/hi'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from 'recharts'

const StatCard = ({ title, value, icon: Icon, color, subtext, trend }: any) => (
  <div className="bg-sidebar border border-sidebar-border p-6 rounded-3xl hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center justify-between">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
        <Icon size={24} className="stroke-2" />
      </div>
      <div className="px-2.5 py-1 rounded-full bg-sidebar-accent text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {trend ? (
          <span className={cn("flex items-center space-x-1", trend > 0 ? "text-emerald-500" : "text-destructive")}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        ) : "Live"}
      </div>
    </div>
    <div className="mt-6 space-y-1">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black text-foreground tracking-tight">{value}</h3>
      {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
    </div>
  </div>
)

const DashboardPage = () => {
  const { selectedProject } = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: analytics, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["dashboard-analytics", selectedProject?._id],
    queryFn: async () => {
      if (!selectedProject?._id) return null;
      const res = await fetch(`/api/analytics?projectId=${selectedProject._id}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!selectedProject?._id,
    staleTime: 30000,
  });

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
    <div className="space-y-10 pb-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-black uppercase tracking-widest">Active Project</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter">
            {selectedProject.name} <span className="text-primary font-heading">Insights</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Overview of your project performance and security audit. Track user activity in real-time.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center space-x-2 px-6 py-3 bg-sidebar/50 border border-sidebar-border rounded-2xl text-sm font-bold hover:bg-sidebar-accent transition-all disabled:opacity-50"
        >
          <HiOutlineRefresh className={cn(isRefetching && "animate-spin")} />
          <span>{isRefetching ? "Updating..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={isLoading ? "..." : analytics?.stats?.totalUsers?.toLocaleString()}
          icon={HiOutlineUsers}
          color="bg-primary/10 text-primary"
          trend={analytics?.stats?.growthRate}
        />
        <StatCard
          title="Active Users"
          value={isLoading ? "..." : analytics?.stats?.activeUsers?.toLocaleString()}
          icon={HiOutlineCursorClick}
          color="bg-emerald-500/10 text-emerald-500"
          subtext="Valid sessions"
        />
        <StatCard
          title="Sessions"
          value={isLoading ? "..." : analytics?.activity?.reduce((acc: any, curr: any) => acc + curr.count, 0).toLocaleString()}
          icon={HiOutlineLightningBolt}
          color="bg-accent/10 text-accent"
          subtext="Last 7 days"
        />
        <StatCard
          title="Security Status"
          value="Healthy"
          icon={HiOutlineShieldCheck}
          color="bg-emerald-500/10 text-emerald-500"
          subtext="SSL & CORS Active"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-8 bg-sidebar border border-sidebar-border rounded-4xl p-8 h-96 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight">User Acquisition</h3>
              <p className="text-xs text-muted-foreground">New users over the last 30 days</p>
            </div>
            <Link href="/analytics" className="text-xs font-bold text-primary hover:underline">View Full Analysis</Link>
          </div>
          <div className="flex-1 w-full mt-2">
            {isLoading ? (
              <div className="w-full h-full bg-sidebar-accent/20 animate-pulse rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.growth}>
                  <defs>
                    <linearGradient id="colorCountDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="_id"
                    hide
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'black', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCountDash)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-sidebar border border-sidebar-border rounded-4xl p-8 h-96 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold tracking-tight">Recent Users</h3>
            <Link href="/users" className="p-2 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors">
              <HiOutlineUserGroup className="text-primary" />
            </Link>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-sidebar-accent/50" />
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-sidebar-accent/50 rounded" />
                    <div className="h-3 w-32 bg-sidebar-accent/50 rounded" />
                  </div>
                </div>
              ))
            ) : analytics?.recentUsers?.length > 0 ? (
              analytics.recentUsers.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate tracking-tight">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate opacity-60">{user.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {user.provider}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <HiOutlineUsers size={32} />
                <p className="text-xs mt-2 font-medium italic">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage