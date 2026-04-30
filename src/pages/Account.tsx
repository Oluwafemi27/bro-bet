import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, LogOut, Copy, Sun, Moon, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Account = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bets, setBets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Check if user is admin using RPC, with fallback to user_roles table check
      const checkAdminStatus = async () => {
        try {
          // Try RPC function first
          const { data, error } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin"
          });

          if (error) {
            console.warn("RPC has_role error (expected if SQL not run yet):", error.message);
            // Fallback: check user_roles table directly
            const { data: roleData, error: roleError } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .eq("role", "admin")
              .limit(1);

            if (roleError) {
              console.error("Error checking user_roles table:", roleError);
              setIsAdmin(false);
            } else {
              setIsAdmin((roleData && roleData.length > 0) || false);
            }
          } else {
            setIsAdmin(!!data);
          }
        } catch (err) {
          console.error("Unexpected error in admin check:", err);
          setIsAdmin(false);
        }
      };

      checkAdminStatus();

      // Load user data
      supabase.from("bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data, error }) => {
          if (error) console.error("Error fetching bets:", error);
          setBets(data || []);
        });

      supabase.from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data, error }) => {
          if (error) console.error("Error fetching transactions:", error);
          setTransactions(data || []);
        });
    }
  }, [user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("light");
  };

  const copyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({ title: "Referral code copied!" });
    }
  };

  // Show loading while auth is initializing
  if (loading) {
    return (
      <Layout>
        <div className="container space-y-4 py-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </Layout>
    );
  }

  // If auth is done but no user, redirect will happen in the effect above
  if (!user) {
    return null;
  }

  // If we have a user but still loading profile, show placeholder
  if (!profile) {
    return (
      <Layout>
        <div className="container space-y-4 py-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container space-y-4 py-4">
        {/* Balance Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/20 to-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Main Balance</p>
                <p className="font-display text-3xl font-bold text-foreground">₦{profile.balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Bonus:</span>
              <span className="font-semibold text-naija-gold">₦{profile.bonus_balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-14 flex-col gap-1" onClick={() => toast({ title: "Deposit coming soon!" })}>
            <ArrowDownCircle className="h-5 w-5" />
            <span className="text-xs">Deposit</span>
          </Button>
          <Button variant="outline" className="h-14 flex-col gap-1" onClick={() => toast({ title: "Withdrawal request submitted!" })}>
            <ArrowUpCircle className="h-5 w-5" />
            <span className="text-xs">Withdraw</span>
          </Button>
        </div>

        {/* Referral */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Your Referral Code</p>
              <p className="font-display text-lg font-bold text-primary">{profile.referral_code}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyReferral}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Admin Panel Button */}
        {isAdmin && (
          <Button className="w-full justify-start gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => navigate("/admin")}>
            <Shield className="h-4 w-4" /> Admin Panel
          </Button>
        )}

        {/* Bet History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" /> Bet History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bets yet</p>
            ) : (
              bets.map((bet) => (
                <div key={bet.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div>
                    <p className="text-sm font-medium">₦{bet.stake} → ₦{bet.potential_win}</p>
                    <p className="text-xs text-muted-foreground">{new Date(bet.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bet.status === "won" ? "bg-primary/20 text-primary" : bet.status === "lost" ? "bg-destructive/20 text-destructive" : "bg-naija-gold/20 text-naija-gold"}`}>
                    {bet.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
