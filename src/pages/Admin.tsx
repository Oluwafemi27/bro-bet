import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Users, Receipt, TrendingUp, Megaphone, BarChart3, DollarSign, Activity, Trophy, Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bets' | 'transactions' | 'analytics' | 'promotions'>('overview');
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [promoFormData, setPromoFormData] = useState({ title: '', description: '', image_url: '' });
  const [savingPromo, setSavingPromo] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        if (!data) {
          toast({ title: "Access denied", variant: "destructive" });
          navigate("/");
        } else {
          setIsAdmin(true);
          loadData();
        }
        setChecking(false);
      });
    }
  }, [user, loading]);

  const loadData = async () => {
    const [u, b, t, p] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("bets").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("promotions").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(u.data || []);
    setBets(b.data || []);
    setTransactions(t.data || []);
    setPromotions(p.data || []);
  };

  const togglePromo = async (id: string, isActive: boolean) => {
    await supabase.from("promotions").update({ is_active: !isActive }).eq("id", id);
    loadData();
    toast({ title: `Promotion ${!isActive ? "activated" : "deactivated"}` });
  };

  const savePromotion = async () => {
    if (!promoFormData.title.trim()) {
      toast({ title: "Please enter a promotion title", variant: "destructive" });
      return;
    }
    setSavingPromo(true);
    try {
      if (editingPromo) {
        await supabase.from("promotions").update(promoFormData).eq("id", editingPromo.id);
        toast({ title: "Promotion updated successfully" });
      } else {
        await supabase.from("promotions").insert([promoFormData]);
        toast({ title: "Promotion created successfully" });
      }
      setShowPromoForm(false);
      setEditingPromo(null);
      setPromoFormData({ title: '', description: '', image_url: '' });
      loadData();
    } finally {
      setSavingPromo(false);
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await supabase.from("promotions").delete().eq("id", id);
      toast({ title: "Promotion deleted successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Failed to delete promotion", variant: "destructive" });
    }
  };

  const startEditPromo = (promo: any) => {
    setEditingPromo(promo);
    setPromoFormData({ title: promo.title, description: promo.description, image_url: promo.image_url });
    setShowPromoForm(true);
  };

  const calculateAnalytics = () => {
    const totalStaked = bets.reduce((sum, b) => sum + (b.stake || 0), 0);
    const totalPotentialWin = bets.reduce((sum, b) => sum + (b.potential_win || 0), 0);
    const wonBets = bets.filter(b => b.status === 'won').length;
    const lostBets = bets.filter(b => b.status === 'lost').length;
    const pendingBets = bets.filter(b => b.status === 'pending').length;

    // Revenue from user losses and payouts from wins
    const totalRevenue = wonBets > 0 ? bets.filter(b => b.status === 'lost').reduce((sum, b) => sum + (b.stake || 0), 0) : 0;
    const totalPayouts = transactions.filter(t => t.type === 'win').reduce((sum, t) => sum + (t.amount || 0), 0);
    const successRate = bets.length > 0 ? ((wonBets / bets.length) * 100).toFixed(1) : 0;

    return {
      totalStaked,
      totalPotentialWin,
      wonBets,
      lostBets,
      pendingBets,
      totalRevenue,
      totalPayouts,
      successRate,
      avgStake: bets.length > 0 ? (totalStaked / bets.length).toFixed(2) : 0,
    };
  };

  const getChartData = () => {
    // Group bets by date for daily stats
    const dailyStats: { [key: string]: { date: string; bets: number; revenue: number } } = {};

    bets.forEach(b => {
      const date = new Date(b.created_at).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { date, bets: 0, revenue: 0 };
      }
      dailyStats[date].bets += 1;
    });

    transactions.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString();
      if (dailyStats[date]) {
        dailyStats[date].revenue += t.amount || 0;
      }
    });

    return Object.values(dailyStats).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
  };

  const getBetStatusData = () => {
    const analytics = calculateAnalytics();
    return [
      { name: 'Won', value: analytics.wonBets, fill: '#10b981' },
      { name: 'Lost', value: analytics.lostBets, fill: '#ef4444' },
      { name: 'Pending', value: analytics.pendingBets, fill: '#f59e0b' },
    ];
  };

  if (loading || checking) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const analytics = calculateAnalytics();
  const chartData = getChartData();
  const betStatusData = getBetStatusData();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-0">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'users', label: 'Users', icon: '👥' },
          { id: 'bets', label: 'Bets', icon: '🎯' },
          { id: 'transactions', label: 'Transactions', icon: '💰' },
          { id: 'promotions', label: 'Promotions', icon: '🎁' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Users", value: users.length, icon: Users, color: "text-primary" },
              { label: "Total Bets", value: bets.length, icon: Trophy, color: "text-naija-gold" },
              { label: "Total Transactions", value: transactions.length, icon: TrendingUp, color: "text-naija-green-light" },
              { label: "Active Promotions", value: promotions.filter(p => p.is_active).length, icon: Megaphone, color: "text-destructive" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₦{analytics.totalStaked.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Across {bets.length} bets</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">₦{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">From user losses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{analytics.successRate}%</p>
                <p className="text-xs text-muted-foreground">{analytics.wonBets} wins out of {bets.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Promotions Section */}
          <Card>
            <CardHeader><CardTitle>Active Promotions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {promotions.filter(p => p.is_active).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <Switch checked={p.is_active} onCheckedChange={() => togglePromo(p.id, p.is_active)} />
                </div>
              ))}
              {promotions.filter(p => p.is_active).length === 0 && <p className="text-sm text-muted-foreground">No active promotions</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Balance</th>
                    <th className="p-2">KYC</th>
                    <th className="p-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 50).map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="p-2 font-medium">{u.full_name}</td>
                      <td className="p-2 text-muted-foreground text-xs">{u.email}</td>
                      <td className="p-2 font-mono">₦{Number(u.balance).toFixed(2)}</td>
                      <td className="p-2"><span className={`text-xs px-2 py-1 rounded ${u.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.kyc_verified ? 'Verified' : 'Pending'}</span></td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bets Tab */}
      {activeTab === 'bets' && (
        <Card>
          <CardHeader>
            <CardTitle>Bets ({bets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-2">Stake</th>
                    <th className="p-2">Potential</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Code</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.slice(0, 50).map((b) => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="p-2 font-mono">₦{Number(b.stake).toFixed(2)}</td>
                      <td className="p-2 font-mono">₦{Number(b.potential_win).toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.status === "won" ? "bg-green-100 text-green-800" : b.status === "lost" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs">{b.booking_code}</td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-2">Type</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 50).map((t) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="p-2 text-xs font-medium">{t.type}</td>
                      <td className="p-2 font-mono">₦{Number(t.amount).toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-1 rounded ${t.status === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs">{t.reference || '-'}</td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions Tab */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          {showPromoForm ? (
            <Card>
              <CardHeader>
                <CardTitle>{editingPromo ? 'Edit Promotion' : 'Create New Promotion'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Promotion title"
                    value={promoFormData.title}
                    onChange={(e) => setPromoFormData({ ...promoFormData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Promotion description"
                    value={promoFormData.description || ''}
                    onChange={(e) => setPromoFormData({ ...promoFormData, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={promoFormData.image_url || ''}
                    onChange={(e) => setPromoFormData({ ...promoFormData, image_url: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={savePromotion} disabled={savingPromo}>
                    {savingPromo ? 'Saving...' : editingPromo ? 'Update Promotion' : 'Create Promotion'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPromoForm(false);
                      setEditingPromo(null);
                      setPromoFormData({ title: '', description: '', image_url: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button onClick={() => setShowPromoForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create New Promotion
              </Button>
              <Card>
                <CardHeader>
                  <CardTitle>All Promotions ({promotions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {promotions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No promotions yet</p>
                  ) : (
                    promotions.map((promo) => (
                      <div key={promo.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex-1">
                          <p className="font-medium">{promo.title}</p>
                          <p className="text-sm text-muted-foreground">{promo.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: <span className={promo.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {promo.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={promo.is_active} onCheckedChange={() => togglePromo(promo.id, promo.is_active)} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditPromo(promo)}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePromotion(promo.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bet Outcomes</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={betStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {betStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Average Stake</p>
                  <p className="text-2xl font-bold">₦{Number(analytics.avgStake).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Potential Payouts</p>
                  <p className="text-2xl font-bold">₦{analytics.totalPotentialWin.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Payouts Made</p>
                  <p className="text-2xl font-bold text-red-600">₦{analytics.totalPayouts.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Stats Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bets" fill="#3b82f6" name="Bets Placed" />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue (₦)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
