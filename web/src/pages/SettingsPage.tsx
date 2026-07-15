import { useState } from "react";
import { User, Bell, Palette, Shield, Globe, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import { toast } from "sonner";

export function SettingsPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount } = useNotifications();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
          <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-1.5 h-4 w-4" />Theme</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-4 w-4" />Alerts</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-1.5 h-4 w-4" />Privacy</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
              <span className="text-xs text-muted-foreground">
                Member since {new Date(user?.joinedDate || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>

            <Button onClick={handleSave} className="shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="p-6 space-y-5">
            <div>
              <h3 className="font-display text-lg font-semibold mb-1">Theme Preference</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose how DiaryVerse looks to you</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { if (isDark) toggleTheme(); }}
                className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${!isDark ? "border-primary shadow-md" : "border-border hover:border-primary/30"}`}
              >
                <div className="h-24 rounded-lg bg-gradient-to-br from-amber-50 to-rose-50 mb-3 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-sm font-medium">Light Mode</p>
                <p className="text-xs text-muted-foreground">Warm and bright</p>
              </button>

              <button
                onClick={() => { if (!isDark) toggleTheme(); }}
                className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${isDark ? "border-primary shadow-md" : "border-border hover:border-primary/30"}`}
              >
                <div className="h-24 rounded-lg bg-gradient-to-br from-slate-900 to-indigo-950 mb-3 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-indigo-400" />
                </div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Easy on the eyes</p>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">System preference</p>
                <p className="text-xs text-muted-foreground">Auto-switch based on device setting</p>
              </div>
              <Switch checked={false} />
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Get instant alerts in browser</p>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Summary of your week every Sunday</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Recent Notifications ({unreadCount} unread)</p>
              <div className="space-y-1.5">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
                    <span className="text-muted-foreground">{n.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-4">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Private by Default</p>
                <p className="text-xs text-muted-foreground">New entries are private unless changed</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Show Profile Publicly</p>
                <p className="text-xs text-muted-foreground">Allow others to see your diary</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Analytics Tracking</p>
                <p className="text-xs text-muted-foreground">Help improve DiaryVerse</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" size="sm">
                Delete All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">This will permanently delete all your diary entries and media.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
