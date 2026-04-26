import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
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
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [statusFilter, deposits]);

  const loadDeposits = async () => {
    try {
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
      await supabase.from("transactions").update({ status: "completed" }).eq("id", id);
      toast({ title: "Deposit approved" });
      loadDeposits();
    } catch (err: any) {
      toast({ title: "Error approving deposit", variant: "destructive" });
    }
  };

  const rejectDeposit = async (id: string) => {
    try {
      await supabase.from("transactions").update({ status: "rejected" }).eq("id", id);
      toast({ title: "Deposit rejected" });
      loadDeposits();
    } catch (err: any) {
      toast({ title: "Error rejecting deposit", variant: "destructive" });
    }
  };

  if (loading) {
    return <div>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 mb-4 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Deposits</h2>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deposits</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Deposits List */}
      <Card>
        <CardHeader>
          <CardTitle>Deposits ({filteredDeposits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDeposits.map((deposit) => (
              <div
                key={deposit.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {deposit.status === "pending" && <Clock className="h-5 w-5 text-amber-600" />}
                  {deposit.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {deposit.status === "rejected" && <XCircle className="h-5 w-5 text-red-600" />}
                  <div>
                    <p className="font-medium">₦{Number(deposit.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {deposit.method} • {deposit.reference}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(deposit.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {deposit.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveDeposit(deposit.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectDeposit(deposit.id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredDeposits.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No deposits found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposits;
