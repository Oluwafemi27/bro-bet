import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  activeBets: number;
  pendingWithdrawals: number;
  totalRevenue: number;
  systemHealth: number;
  riskAlerts: number;
}

interface DailyMetric {
  date: string;
  bets: number;
  revenue: number;
  users: number;
}

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [recentBets, setRecentBets] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      const checkAdminAccess = async () => {
        try {
          const { data, error } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });

          if (error) {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .eq("role", "admin")
              .limit(1);

            if (!roleData || roleData.length === 0) {
              toast({ title: "Access denied", variant: "destructive" });
              navigate("/");
              return;
            }
          } else if (!data) {
            toast({ title: "Access denied", variant: "destructive" });
            navigate("/");
            return;
          }

          loadDashboardData();
        } catch (err) {
          console.error("Admin check failed:", err);
          toast({ title: "Access check failed", variant: "destructive" });
          navigate("/");
        }
      };

      checkAdminAccess();
    }
  }, [user, loading, navigate, toast]);

  const loadDashboardData = async () => {
    try {
      const [usersRes, betsRes, txnsRes] = await Promise.all([
        supabase.from("profiles").select("count"),
        supabase.from("bets").select("count"),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      const recentBetsRes = await supabase
        .from("bets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const totalUsers = usersRes.count || 0;
      const activeBets = betsRes.count || 0;
      const transactions = txnsRes.data || [];
      const pendingWithdrawals = transactions.filter(
        (t) => t.type === "withdrawal" && t.status === "pending"
      ).length;
      const totalRevenue = transactions
        .filter((t) => t.type === "win_payout")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        totalUsers,
        activeBets,
        pendingWithdrawals,
        totalRevenue,
        systemHealth: 98, // Placeholder
        riskAlerts: 3, // Placeholder
      });

      setRecentBets(recentBetsRes.data || []);

      // Mock daily metrics
      const mockMetrics: DailyMetric[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockMetrics.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          bets: Math.floor(Math.random() * 500) + 100,
          revenue: Math.floor(Math.random() * 5000000) + 1000000,
          users: Math.floor(Math.random() * 100) + 20,
        });
      }
      setDailyMetrics(mockMetrics);

      // Mock risk alerts
      setRiskAlerts([
        {
          id: 1,
          type: "high_stake",
          message: "User placed ₦5M bet - verify legitimacy",
          severity: "high",
          timestamp: new Date(),
        },
        {
          id: 2,
          type: "multi_account",
          message: "Detected 3 accounts from same IP - possible bonus abuse",
          severity: "medium",
          timestamp: new Date(),
        },
        {
          id: 3,
          type: "withdrawal",
          message: "Large withdrawal pending KYC completion",
          severity: "medium",
          timestamp: new Date(),
        },
      ]);

      setStatsLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({ title: "Failed to load dashboard", variant: "destructive" });
      setStatsLoading(false);
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (!stats) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Active Bets</p>
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{stats.activeBets.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingWithdrawals}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₦{(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{stats.systemHealth}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.riskAlerts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Bets & Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="bets" fill="#3b82f6" name="Bets Placed" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (₦)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" name="New Users" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Risk & Fraud Alerts
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <p className="font-medium text-sm">{alert.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            <Button variant="outline" className="w-full gap-2">
              View All Alerts <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Bets
              <Trophy className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBets.slice(0, 5).map((bet) => (
                <div key={bet.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="font-medium text-sm">Bet #{bet.booking_code}</p>
                    <p className="text-xs text-muted-foreground">₦{Number(bet.stake).toFixed(2)}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      bet.status === "won"
                        ? "bg-green-100 text-green-800"
                        : bet.status === "lost"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {bet.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full gap-2 mt-4">
              View All Bets <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => navigate("/admin/users/list")}
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => navigate("/admin/bets/all")}
            >
              <Trophy className="h-4 w-4" />
              View Bets
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => navigate("/admin/finance/deposits")}
            >
              <DollarSign className="h-4 w-4" />
              Deposits
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => navigate("/admin/risk/alerts")}
            >
              <AlertTriangle className="h-4 w-4" />
              Risk Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
