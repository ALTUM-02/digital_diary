import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_USERS, MOCK_ACTIVITY_LOGS } from "@/lib/mock-data";
import { MoreHorizontal, Mail, Calendar } from "lucide-react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AdminUsersPage() {
  const users = MOCK_USERS.filter((u) => u.role === "user");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">{users.length} registered users</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Users", value: users.length, color: "text-emerald-500" },
          { label: "Total Entries", value: users.reduce((s, u) => s + u.entriesCount, 0), color: "text-amber-500" },
          { label: "Avg Entries/User", value: Math.round(users.reduce((s, u) => s + u.entriesCount, 0) / users.length), color: "text-teal-500" },
          { label: "New This Month", value: 3, color: "text-violet-500" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <h3 className="font-display text-lg font-semibold">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.entriesCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/50">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Activity log */}
      <Card className="p-5">
        <h3 className="font-display text-lg font-semibold mb-4">Activity Log</h3>
        <div className="space-y-2">
          {MOCK_ACTIVITY_LOGS.map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={MOCK_USERS.find(u => u.id === log.userId)?.avatar} alt={log.userName} />
                <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{log.userName}</span>
                  <span className="text-muted-foreground"> — {log.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">{log.details}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{timeAgo(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
