import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  bank_account: string;
  status: string;
  created_at: string;
}

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWithdrawals();

    const channel = supabase
      .channel("withdrawals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: "type=eq.withdrawal" },
        () => {
          loadWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const approveWithdrawal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Withdrawal approved" });
    } catch (err: any) {
      toast({ title: "Error approving withdrawal", description: err.message, variant: "destructive" });
    }
  };

  const rejectWithdrawal = async (id: string) => {
    try {
      // Get withdrawal details
      const { data: withdrawal, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;

      // Update status
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", id);
      
      if (updateError) throw updateError;

      // Refund balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", withdrawal.user_id)
        .single();
      
      if (profileError) throw profileError;

      const newBalance = Number(profile.balance || 0) + Number(withdrawal.amount);
      
      await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", withdrawal.user_id);

      toast({ title: "Withdrawal rejected and balance refunded" });
    } catch (err: any) {
      toast({ title: "Error rejecting withdrawal", description: err.message, variant: "destructive" });
    }
  };

  const loadWithdrawals = async () => {
    try {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false });

      setWithdrawals(data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Withdrawals</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-amber-600">
                {withdrawals.filter((w) => w.status === "pending").length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {withdrawals.filter((w) => w.status === "completed").length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">
                ₦{withdrawals
                  .reduce((sum, w) => sum + (w.amount || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawals ({withdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3">Amount</th>
                  <th className="p-3 hidden sm:table-cell">Bank Account</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 hidden md:table-cell">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-border/50">
                    <td className="p-3 font-mono">
                      <div>
                        ₦{Number(w.amount).toFixed(2)}
                        <div className="sm:hidden text-[10px] text-muted-foreground mt-1">{w.bank_account}</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm hidden sm:table-cell">{w.bank_account}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-medium ${
                          w.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-xs hidden md:table-cell">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {w.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => approveWithdrawal(w.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => rejectWithdrawal(w.id)}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawals;
