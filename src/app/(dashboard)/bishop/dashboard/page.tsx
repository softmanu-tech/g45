"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GroupSummary {
  groupId: string;
  groupName: string;
  leaderName: string;
  memberCount: number;
  eventCount: number;
  attendanceCount: number;
}

interface BishopDashboardData {
  stats: {
    totalLeaders: number;
    totalGroups: number;
    totalMembers: number;
    totalAttendance: number;
  };
  groups: GroupSummary[];
}

export default function BishopDashboard() {
  const [data, setData] = useState<BishopDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/bishop/dashboard");
        const json = (await res.json()) as BishopDashboardData;
        setData(json);
      } catch (err) {
        console.error("Failed to fetch bishop dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading message="Loading bishop analytics..." size="lg" />;
  if (!data)
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <strong>Error:</strong> Failed to load dashboard data
        </div>
      </div>
    );

  const { stats, groups } = data;

  return (
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <div className="bg-blue-200/90 backdrop-blur-md border-b border-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-800">Bishop Dashboard</h1>
              <p className="text-sm text-blue-700 mt-1">Overview of church statistics and performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-6 text-center">
              <h2 className="text-sm font-medium text-blue-700 uppercase tracking-wide">Leaders</h2>
              <p className="text-3xl font-bold text-blue-800">{stats.totalLeaders}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-6 text-center">
              <h2 className="text-sm font-medium text-blue-700 uppercase tracking-wide">Groups</h2>
              <p className="text-3xl font-bold text-blue-800">{stats.totalGroups}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-6 text-center">
              <h2 className="text-sm font-medium text-blue-700 uppercase tracking-wide">Members</h2>
              <p className="text-3xl font-bold text-blue-800">{stats.totalMembers}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-200/90 backdrop-blur-md border border-blue-300">
            <CardContent className="p-6 text-center">
              <h2 className="text-sm font-medium text-blue-700 uppercase tracking-wide">Attendance</h2>
              <p className="text-3xl font-bold text-blue-800">{stats.totalAttendance}</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300 p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Group Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group: GroupSummary) => (
              <Card key={group.groupId} className="bg-white/80 backdrop-blur-sm border border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg mb-1 text-blue-800">{group.groupName}</h4>
                  <p className="text-sm text-blue-700">
                    Leader: {group.leaderName}
                  </p>
                  <div className="mt-2 text-sm space-y-1">
                    <p className="text-blue-700">Members: {group.memberCount}</p>
                    <p className="text-blue-700">Events: {group.eventCount}</p>
                    <p className="text-blue-700">Attendance Records: {group.attendanceCount}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-blue-200/90 backdrop-blur-md rounded-lg shadow-sm border border-blue-300 p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Attendance by Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groups}>
              <XAxis dataKey="groupName" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="attendanceCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
