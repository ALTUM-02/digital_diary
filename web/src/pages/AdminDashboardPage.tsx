import { useMemo } from "react";
import { Users, BookOpen, ImageIcon, Video, TrendingUp, Activity, BarChart3, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChartCard,
  PieChartCard,
  LineChartCard,
  DonutChartCard,
} from "@/components/charts/Charts";
import { useDiary } from "@/context/DiaryContext";
import { MOCK_USERS, MOCK_ACTIVITY_LOGS, ADMIN_CHARTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AdminDashboardPage() {
  const { entries } = useDiary();

  const stats = useMemo(() => {
    const totalImages = entries.reduce((sum, e) => sum + e.media.filter(m => m.type === "image").length, 0);
    const totalVideos = entries.reduce((sum, e) => sum + e.media.filter(m => m.type === "video").length, 0);
    return {
      totalUsers: MOCK_USERS.filter(u => u.role === "user").length,
      totalEntries: entries.length + 200,
      totalImages: totalImages + 150,
      totalVideos: totalVideos + 45,
    };
  }, [entries]);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-rose-500 to-pink-500", trend: "+12%" },
    { label: "Total Entries", value: stats.totalEntries, icon: BookOpen, color: "from-amber-500 to-orange-500", trend: "+24%" },
    { label: "Images Uploaded", value: stats.totalImages, icon: ImageIcon, color: "from-teal-500 to-cyan-500", trend: "+18%" },
    { label: "Videos Uploaded", value: stats.totalVideos, icon: Video, color: "from-violet-500 to-purple-500", trend: "+7%" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Overview of all users, entries, and activity</p>
        </div>
        <Badge variant="secondary" className="h-7 px-3 text-xs">
          <Activity className="mr-1.5 h-3 w-3 text-emerald-500" />
          Live data
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-border p-5 animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className={cn("absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-10 blur-xl", stat.color)} />
            <div className="flex items-center justify-between mb-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md", stat.color)}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart - entries by day */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Entries by Day</h3>
              <p className="text-xs text-muted-foreground">Last 7 days activity</p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="h-[260px]">
            <BarChartCard data={ADMIN_CHARTS.entriesByDay} />
          </div>
        </Card>

        {/* Pie chart - mood distribution */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">Mood Distribution</h3>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </div>
          <div className="h-[260px]">
            <PieChartCard data={ADMIN_CHARTS.moodDistribution} />
          </div>
        </Card>

        {/* Line chart - user activity trend */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">User Activity Trend</h3>
            <p className="text-xs text-muted-foreground">Entries & uploads over time</p>
          </div>
          <div className="h-[260px]">
            <LineChartCard
              data={ADMIN_CHARTS.userActivityTrend}
              lines={[
                { key: "entries", color: "hsl(346 77% 50%)", label: "Entries" },
                { key: "uploads", color: "hsl(174 72% 28%)", label: "Uploads" },
              ]}
            />
          </div>
        </Card>

        {/* Donut chart - media type split */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-display text-lg font-semibold">Media Type Split</h3>
            <p className="text-xs text-muted-foreground">Images vs videos vs text</p>
          </div>
          <div className="h-[260px]">
            <DonutChartCard data={ADMIN_CHARTS.mediaTypeSplit} />
          </div>
        </Card>
      </div>

      {/* Bottom row: Users + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top users */}
        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold mb-4">Top Users</h3>
          <div className="space-y-3">
            {MOCK_USERS.filter(u => u.role === "user")
              .sort((a, b) => b.entriesCount - a.entriesCount)
              .map((user, idx) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{user.entriesCount}</p>
                    <p className="text-[10px] text-muted-foreground">entries</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Activity feed */}
        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {MOCK_ACTIVITY_LOGS.map((log, idx) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.userName}</span>
                    <span className="text-muted-foreground"> {log.action.toLowerCase()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
