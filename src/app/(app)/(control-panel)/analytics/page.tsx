"use client";

import { useProjectStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import {
  HiOutlineUsers,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineRefresh,
  HiOutlineTrendingUp,
  HiOutlineCursorClick,
  HiOutlineUserAdd
} from "react-icons/hi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sidebar/90 border border-sidebar-border p-4 rounded-2xl backdrop-blur-md shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-foreground">
          <span className="text-primary mr-2">●</span>
          {payload[0].value} Users
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
  <div className="bg-sidebar/50 border border-sidebar-border p-6 rounded-3xl backdrop-blur-sm hover:shadow-lg transition-all group">
    <div className="flex items-center justify-between">
      <div className={cn("p-3 rounded-2xl bg-opacity-10", color)}>
        <Icon size={24} className="stroke-2" />
      </div>
      {trend && (
        <div className={cn("flex items-center space-x-1 text-xs font-bold", trend > 0 ? "text-emerald-500" : "text-destructive")}>
          <HiOutlineTrendingUp className={cn(trend < 0 && "rotate-180")} />
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div className="mt-6 space-y-1">
      <h3 className="text-3xl font-black tracking-tight text-foreground">{value}</h3>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      {subtext && <p className="text-[10px] text-muted-foreground pt-1">{subtext}</p>}
    </div>
  </div>
);

export default function AnalyticsPage() {
  const { selectedProject } = useProjectStore();

  const { data: analytics, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["analytics", selectedProject?._id],
    queryFn: async () => {
      if (!selectedProject?._id) return null;
      const res = await fetch(`/api/analytics?projectId=${selectedProject._id}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!selectedProject?._id,
    staleTime: 60000, // 1 minute
  });

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <HiOutlineChartBar size={64} className="text-muted-foreground/20" />
        <h2 className="text-xl font-bold text-muted-foreground text-center">
          No Project Selected<br />
          <span className="text-sm font-normal">Select a project to view its performance metrics and usage statistics.</span>
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-64 bg-sidebar-accent/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-sidebar-accent/20 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-sidebar-accent/20 rounded-4xl" />
          <div className="h-96 bg-sidebar-accent/20 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-2">
          <HiOutlineChartBar size={32} />
        </div>
        <h2 className="text-xl font-bold">Failed to Load Analytics</h2>
        <p className="text-muted-foreground text-sm max-w-xs">Something went wrong while fetching your data. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl px-8">Retry</Button>
      </div>
    );
  }

  const providerDataCombined = analytics.providers.map((p: any) => ({
    name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
    value: p.count
  }));

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Project <span className="text-primary font-heading">Analytics</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            In-depth analysis of your project's user growth, engagement patterns, and integration performance.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-2xl h-12 px-6 border-sidebar-border bg-sidebar/50 hover:bg-sidebar-accent transition-all shrink-0"
          disabled={isRefetching}
        >
          <HiOutlineRefresh className={cn("mr-2", isRefetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.stats.totalUsers.toLocaleString()}
          icon={HiOutlineUsers}
          color="bg-primary text-primary"
          subtext="All-time registered users"
        />
        <StatCard
          title="Active Users"
          value={analytics.stats.activeUsers.toLocaleString()}
          icon={HiOutlineCursorClick}
          color="bg-emerald-500 text-emerald-500"
          subtext="Users with valid session"
        />
        <StatCard
          title="Growth Rate"
          value={`${analytics.stats.growthRate}%`}
          icon={HiOutlineTrendingUp}
          color="bg-accent text-accent"
          subtext="Relative Increase"
          trend={parseFloat(analytics.stats.growthRate)}
        />
        <StatCard
          title="Total Sessions"
          value={analytics.activity.reduce((acc: any, curr: any) => acc + curr.count, 0).toLocaleString()}
          icon={HiOutlineLightningBolt}
          color="bg-orange-500 text-orange-500"
          subtext="Sessions in last 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Growth Trend */}
        <div className="lg:col-span-8 bg-sidebar/50 border border-sidebar-border rounded-4xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">User Acquisition</h3>
              <p className="text-xs text-muted-foreground mt-1">Daily new users over the last 30 days</p>
            </div>
            <div className="p-2 rounded-xl bg-sidebar-accent/50">
              <HiOutlineUserAdd className="text-primary" size={20} />
            </div>
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.growth}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'gray' }}
                  dy={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Breakdown */}
        <div className="lg:col-span-4 bg-sidebar/50 border border-sidebar-border rounded-4xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold tracking-tight mb-8">Provider Source</h3>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerDataCombined}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {providerDataCombined.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {providerDataCombined.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-bold text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-black text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Trend */}
        <div className="lg:col-span-12 bg-sidebar/50 border border-sidebar-border rounded-4xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Weekly Engagement</h3>
              <p className="text-xs text-muted-foreground mt-1">Number of active sessions generated across all providers</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.activity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'gray' }}
                  dy={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary)"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                  animationDuration={2500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}