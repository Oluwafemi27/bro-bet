import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, CheckCircle, XCircle, Clock, Wallet, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  reference: string | null;
  created_at: string;
}

const Deposits: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const { toast } = useToast();

  useEffect(() => {
    loadDeposits();

    const channel = supabase
      .channel("deposits-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: "type=eq.deposit" },
        () => {
          loadDeposits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [statusFilter, deposits]);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "deposit")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setDeposits(data || []);
    } catch (err: any) {
      toast({ title: "Error loading deposits", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterDeposits = () => {
    let filtered = deposits;
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    setFilteredDeposits(filtered);
  };

  const approveDeposit = async (id: string) => {
    try {
      // Get the deposit details first to know user_id and amount
      const { data: deposit, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      if (deposit.status !== 'pending') {
        toast({ title: "Deposit already processed", variant: "destructive" });
        return;
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", id);
      
      if (updateError) throw updateError;

      // Credit user balance - in a real app this would be in a DB trigger or RPC
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", deposit.user_id)
        .single();
      
      if (profileError) throw profileError;

      const newBalance = Number(profile.balance || 0) + Number(deposit.amount);
      
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", deposit.user_id);
      
      if (balanceError) throw balanceError;

      toast({ title: "Deposit approved and balance credited" });
      loadDeposits();
    } catch (err: any) {
      toast({ title: "Error approving deposit", description: err.message, variant: "destructive" });
    }
  };

  const rejectDeposit = async (id: string) => {
    try {
      const { error } = await supabase.from("transactions").update({ status: "failed" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Deposit rejected" });
      loadDeposits();
    } catch (err: any) {
      toast({ title: "Error rejecting deposit", variant: "destructive" });
    }
  };

  return (
    <AdminPageShell
      title="Deposits Management"
      description="Review and process user deposit transactions."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button className="gap-2 bg-primary">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {deposits.filter(d => d.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-muted-foreground">Today's Volume</p>
              <p className="text-2xl font-bold">
                ₦{deposits
                  .filter(d => d.status === 'completed' && new Date(d.created_at).toDateString() === new Date().toDateString())
                  .reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full md:max-w-sm relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
                  placeholder="Search reference or user ID..."
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deposits</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed/Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deposits Table */}
        <Card className="overflow-hidden border border-border/50">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/10">
                      <th className="px-6 py-4 text-left font-semibold">Amount</th>
                      <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Reference</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold hidden lg:table-cell">Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((deposit) => (
                      <tr key={deposit.id} className="border-b hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div>
                            ₦{Number(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            <div className="sm:hidden text-[10px] text-muted-foreground font-mono mt-1 uppercase">
                              {deposit.reference || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                          {deposit.reference || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold border ${
                            deposit.status === "completed" 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : deposit.status === "pending"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}>
                            {deposit.status === "pending" && <Clock className="h-3 w-3" />}
                            {deposit.status === "completed" && <CheckCircle className="h-3 w-3" />}
                            {deposit.status === "failed" && <XCircle className="h-3 w-3" />}
                            <span className="hidden xs:inline">{deposit.status.toUpperCase()}</span>
                            <span className="xs:hidden">{deposit.status.charAt(0).toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                          {new Date(deposit.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {deposit.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" className="h-7 md:h-8 px-2 md:px-3 text-xs bg-green-600 hover:bg-green-700" onClick={() => approveDeposit(deposit.id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 md:h-8 px-2 md:px-3 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectDeposit(deposit.id)}>
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-8 text-xs">Details</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filteredDeposits.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p className="font-medium">No deposit records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  );
};

export default Deposits;
