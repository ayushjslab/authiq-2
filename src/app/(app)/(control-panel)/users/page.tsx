"use client";

import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/lib/store";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  HiOutlineSearch,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from "react-icons/hi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const USERS_PER_PAGE = 20;

export default function UsersPage() {
  const { selectedProject } = useProjectStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ["web-users", selectedProject?._id, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedProject?._id) return null;
      const res = await fetch(`/api/web-users?projectId=${selectedProject._id}&search=${debouncedSearch}&page=${pageParam}&limit=${USERS_PER_PAGE}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || lastPage.currentPage >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    },
    initialPageParam: 1,
    enabled: !!selectedProject?._id,
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const users = data?.pages.flatMap((page) => page?.users || []) || [];
  const totalCount = data?.pages[0]?.totalUsers || 0;

  const isActive = (lastLoginAt?: string) => {
    if (!lastLoginAt) return false;
    const expiryMs = selectedProject?.settings?.tokenExpiryTime || 24 * 60 * 60 * 1000;
    return new Date(lastLoginAt).getTime() + expiryMs > Date.now();
  };

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <HiOutlineShieldCheck size={64} className="text-muted-foreground/20" />
        <h2 className="text-xl font-bold text-muted-foreground text-center">
          No Project Selected<br />
          <span className="text-sm font-normal">Please select a project from the navbar to manage its users.</span>
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Project <span className="text-primary font-heading">Users</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Manage and monitor and engagement of users authenticated through your project.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-sidebar/50 border border-sidebar-border px-4 py-2 rounded-2xl backdrop-blur-sm">
          <HiOutlineUserGroup className="text-primary" />
          <span className="text-sm font-bold">{totalCount.toLocaleString()} <span className="text-muted-foreground font-normal ml-1">Total Users</span></span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <HiOutlineSearch className="text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-sidebar/50 border-sidebar-border focus:ring-primary/20 rounded-2xl h-12 shadow-sm transition-all"
          />
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-2xl h-12 px-6 border-sidebar-border bg-sidebar/50 hover:bg-sidebar-accent transition-all shrink-0 w-full md:w-auto"
        >
          <HiOutlineRefresh className={cn("mr-2", status === "pending" && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* User List */}
      <div className="bg-sidebar/30 border border-sidebar-border rounded-3xl overflow-hidden backdrop-blur-md shadow-sm">
        <Table>
          <TableHeader className="bg-sidebar-accent/30">
            <TableRow className="hover:bg-transparent border-sidebar-border">
              <TableHead className="w-[300px] font-bold py-4 pl-6 text-foreground/70 tracking-tight uppercase text-[10px]">User Details</TableHead>
              <TableHead className="font-bold py-4 text-foreground/70 tracking-tight uppercase text-[10px]">Provider</TableHead>
              <TableHead className="font-bold py-4 text-foreground/70 tracking-tight uppercase text-[10px]">Status</TableHead>
              <TableHead className="font-bold py-4 text-foreground/70 tracking-tight uppercase text-[10px]">Last Sign-in</TableHead>
              <TableHead className="font-bold py-4 pr-6 text-right text-foreground/70 tracking-tight uppercase text-[10px]">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === "pending" ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="animate-pulse border-sidebar-border">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-sidebar-accent/50" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-sidebar-accent/50 rounded" />
                        <div className="h-3 w-40 bg-sidebar-accent/50 rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 w-20 bg-sidebar-accent/50 rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-sidebar-accent/50 rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-sidebar-accent/50 rounded" /></TableCell>
                  <TableCell className="pr-6 text-right"><div className="h-4 w-24 bg-sidebar-accent/50 rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((user: any) => (
                <TableRow key={user._id} className="group border-sidebar-border transition-colors hover:bg-sidebar-accent/20">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="relative">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-background border border-sidebar-border" />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ring-1 ring-sidebar-border",
                          isActive(user.lastLoginAt) ? "bg-green-500" : "bg-gray-400"
                        )} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                        user.provider === "google" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          user.provider === "github" ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                      )}>
                        {user.provider}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                      isActive(user.lastLoginAt)
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full mr-1.5", isActive(user.lastLoginAt) ? "bg-green-500" : "bg-muted-foreground")} />
                      {isActive(user.lastLoginAt) ? "Active" : "Inactive"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-foreground/70">
                      <HiOutlineClock className="mr-1.5 opacity-50" />
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : "Never"}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <span className="text-xs font-medium text-foreground/50">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <HiOutlineExclamationCircle size={48} />
                    <p className="text-sm font-medium">No users found for this project</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Loading state indicator at bottom */}
        <div ref={loadMoreRef} className="p-4 text-center">
          {isFetchingNextPage && (
            <div className="flex items-center justify-center space-x-2 text-primary font-bold text-xs animate-pulse">
              <HiOutlineRefresh className="animate-spin" />
              <span>Loading more users...</span>
            </div>
          )}
          {!hasNextPage && users.length > 0 && (
            <p className="text-xs text-muted-foreground italic py-2">You've reached the end of the list.</p>
          )}
        </div>
      </div>
    </div>
  );
}