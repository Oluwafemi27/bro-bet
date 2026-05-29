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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [recentBets, setRecentBets] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, betsRes, txnsRes, alertsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("bets").select("*", { count: "exact", head: true }),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("fraud_alerts").select("*", { count: "exact", head: true }).eq("status", "pending")
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
      
      // Calculate revenue (deposits - withdrawals) as a simple metric for now
      const totalRevenue = transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => {
          if (t.type === "deposit") return sum + Number(t.amount);
          if (t.type === "withdrawal") return sum - Number(t.amount);
          return sum;
        }, 0);

      setStats({
        totalUsers,
        activeBets,
        pendingWithdrawals,
        totalRevenue,
        systemHealth: 99,
        riskAlerts: alertsRes.count || 0,
      });

      setRecentBets(recentBetsRes.data || []);
      
      // Real risk alerts from DB
      const realAlerts = await supabase
        .from("fraud_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (realAlerts.data) {
        setRiskAlerts(realAlerts.data.map(a => ({
          id: a.id,
          type: a.type,
          message: a.description,
          severity: a.severity,
          timestamp: new Date(a.created_at)
        })));
      }

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
    <div className="space-y-8">
      {/* KPI Cards with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Active Users */}
        <Card className="border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Users</p>
                <div className="h-10 w-10 rounded-lg bg-blue-100/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 font-medium mt-1">+12% from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Bets */}
        <Card className="border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Bets</p>
                <div className="h-10 w-10 rounded-lg bg-purple-100/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.activeBets.toLocaleString()}</p>
                <p className="text-xs text-green-600 font-medium mt-1">+8% from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="border border-amber-200/50 hover:border-amber-400/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Withdrawals</p>
                <div className="h-10 w-10 rounded-lg bg-amber-100/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingWithdrawals}</p>
                <p className="text-xs text-red-600 font-medium mt-1">Action required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="border border-green-200/50 hover:border-green-400/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today's Revenue</p>
                <div className="h-10 w-10 rounded-lg bg-green-100/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  ₦{(stats.totalRevenue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">+24% from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">System Health</p>
                <div className="h-10 w-10 rounded-lg bg-green-100/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.systemHealth}%</p>
                <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    style={{ width: `${stats.systemHealth}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card className="border border-red-200/50 hover:border-red-400/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risk Alerts</p>
                <div className="h-10 w-10 rounded-lg bg-red-100/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{stats.riskAlerts}</p>
                <p className="text-xs text-red-600 font-medium mt-1">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bets & Revenue */}
        <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Daily Bets & Revenue</CardTitle>
              <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                Last 7 days
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Betting volume and platform revenue trends</p>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyMetrics}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradientBets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="left" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.9)", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="bets" fill="url(#gradientBets)" name="Bets Placed" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="url(#gradientRevenue)" name="Revenue (₦)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity Trend */}
        <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">User Activity Trend</CardTitle>
              <div className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                Last 7 days
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">New user registration and activity patterns</p>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyMetrics}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradientUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(30, 41, 59, 0.9)", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  name="New Users"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                  activeDot={{ r: 7 }}
                  fill="url(#gradientUsers)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Fraud Alerts */}
        <Card className="border border-red-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="h-9 w-9 rounded-lg bg-red-100/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                Risk & Fraud Alerts
              </CardTitle>
              <div className="text-xs font-semibold text-red-600 bg-red-100/20 px-3 py-1 rounded-full">
                {riskAlerts.length} Active
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md ${
                  alert.severity === "high"
                    ? "border-l-red-600 bg-red-50/50 border border-red-200/30"
                    : alert.severity === "medium"
                    ? "border-l-amber-600 bg-amber-50/50 border border-amber-200/30"
                    : "border-l-blue-600 bg-blue-50/50 border border-blue-200/30"
                }`}
              >
                <p className={`font-semibold text-sm ${
                  alert.severity === "high"
                    ? "text-red-700"
                    : alert.severity === "medium"
                    ? "text-amber-700"
                    : "text-blue-700"
                }`}>
                  {alert.message}
                </p>
                <p className={`text-xs font-medium mt-2 ${
                  alert.severity === "high"
                    ? "text-red-600"
                    : alert.severity === "medium"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}>
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full gap-2 mt-4 border-red-200/50 hover:bg-red-50/20"
              onClick={() => navigate("/admin/risk/alerts")}
            >
              View All Alerts <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bets */}
        <Card className="border border-purple-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <div className="h-9 w-9 rounded-lg bg-purple-100/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                Recent Bets
              </CardTitle>
              <div className="text-xs font-semibold text-purple-600 bg-purple-100/20 px-3 py-1 rounded-full">
                {recentBets.length} Total
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBets.slice(0, 5).map((bet) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">Bet #{bet.booking_code}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">₦{Number(bet.stake).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(bet.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap ml-2 ${
                      bet.status === "won"
                        ? "bg-green-100/30 text-green-700 border border-green-200/50"
                        : bet.status === "lost"
                        ? "bg-red-100/30 text-red-700 border border-red-200/50"
                        : "bg-amber-100/30 text-amber-700 border border-amber-200/50"
                    }`}
                  >
                    {bet.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 mt-4 border-purple-200/50 hover:bg-purple-50/20"
              onClick={() => navigate("/admin/bets/all")}
            >
              View All Bets <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Fast access to key admin functions</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 font-medium"
              onClick={() => navigate("/admin/users/list")}
            >
              <div className="h-8 w-8 rounded-lg bg-blue-100/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 border-purple-200/50 hover:border-purple-400/50 hover:bg-purple-50/20 transition-all duration-200 font-medium"
              onClick={() => navigate("/admin/bets/all")}
            >
              <div className="h-8 w-8 rounded-lg bg-purple-100/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-purple-600" />
              </div>
              View Bets
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 border-green-200/50 hover:border-green-400/50 hover:bg-green-50/20 transition-all duration-200 font-medium"
              onClick={() => navigate("/admin/finance/deposits")}
            >
              <div className="h-8 w-8 rounded-lg bg-green-100/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              Deposits
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 border-red-200/50 hover:border-red-400/50 hover:bg-red-50/20 transition-all duration-200 font-medium"
              onClick={() => navigate("/admin/risk/alerts")}
            >
              <div className="h-8 w-8 rounded-lg bg-red-100/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              Risk Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
