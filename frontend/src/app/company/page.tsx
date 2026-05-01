"use client";

import Link from "next/link";
import { FolderCog, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CompanyPage() {
  return (
    <div className="p-8 text-[#d8e3fb]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[#d8e3fb]">Company Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your policy schemes and monitor distribution</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Scheme Management Card */}
          <Link href="/scheme/upload" className="group">
            <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all h-full cursor-pointer">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <FolderCog className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-white">Scheme Management</CardTitle>
                    <CardDescription>Create and manage distribution schemes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator className="bg-slate-700/50" />
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  <span>Go to Scheme Management</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Analytics Card */}
          <Link href="/scheme/analytics" className="group">
            <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 transition-all h-full cursor-pointer">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-white">Pass-Through Analytics</CardTitle>
                    <CardDescription>Monitor distribution efficiency</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator className="bg-slate-700/50" />
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  <span>View Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Policy Settings Card */}
          <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10 opacity-50 cursor-not-allowed">
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">Policy Settings</CardTitle>
                <CardDescription>Configure company policies</CardDescription>
              </div>
            </CardHeader>
            <Separator className="bg-slate-700/50" />
            <CardContent className="pt-4">
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-bold text-[#d8e3fb] mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Active Schemes</p>
                  <p className="text-2xl font-bold text-[#d8e3fb]">12</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Pass-Through Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">68.5%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Network Nodes</p>
                  <p className="text-2xl font-bold text-blue-400">1,240</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Last Updated</p>
                  <p className="text-2xl font-bold text-slate-400">14h ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#152031]/70 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#d8e3fb] font-medium">Scheme "Winter Campaign 2026" deployed</p>
                  <p className="text-xs text-slate-500">14 hours ago</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Deployed</Badge>
              </div>
              <Separator className="bg-slate-700/50" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#d8e3fb] font-medium">Scheme "Urban Distribution Q2" updated</p>
                  <p className="text-xs text-slate-500">2 days ago</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Updated</Badge>
              </div>
              <Separator className="bg-slate-700/50" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#d8e3fb] font-medium">Network node "Delhi Hub" joined network</p>
                  <p className="text-xs text-slate-500">5 days ago</p>
                </div>
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">Added</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
