import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Eye, MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  created_at: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, typeFilter, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const formattedTransactions = data.map((t: any) => ({
        ...t,
        method: t.reference ? (t.reference.includes("paystack") ? "Paystack" : "Manual") : "System"
      }));

      setTransactions(formattedTransactions);
    } catch (err: any) {
      toast({ title: "Error loading transactions", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filterTransactions = () => {
    let filtered = transactions;
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }
    setFilteredTransactions(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">All Transactions</h1>
          <p className="text-muted-foreground mt-1">{filteredTransactions.length} transactions</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            const csv = "Reference,User ID,Type,Amount,Method,Status,Date\n" +
              filteredTransactions.map(t => `${t.reference},${t.user_id},${t.type.toUpperCase()},₦${Number(t.amount).toLocaleString()},${t.method},${t.status.toUpperCase()},${new Date(t.created_at).toLocaleDateString()}`).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "transactions.csv";
            a.click();
            window.URL.revokeObjectURL(url);
            toast({ title: "Transactions exported successfully" });
          }}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-primary/20 focus:border-primary/40"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 border-primary/20 focus:border-primary/40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="bet_placement">Bet Placements</SelectItem>
                <SelectItem value="bet_win">Bet Wins</SelectItem>
                <SelectItem value="bonus_credit">Bonuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Reference</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground hidden md:table-cell">User ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground hidden lg:table-cell">Method</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground hidden xl:table-cell">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn, idx) => (
                  <tr
                    key={txn.id}
                    className={`border-b border-border/20 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground font-mono text-xs">
                      <div>
                        {txn.reference}
                        <div className="sm:hidden text-xs text-muted-foreground font-normal mt-1">{txn.type.replace(/_/g, " ").toUpperCase()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs hidden md:table-cell">{txn.user_id}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs px-2 py-1 rounded-full font-bold bg-secondary/30">
                        {txn.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold">
                      {txn.type.includes("withdrawal") || txn.type.includes("bet") ? "-" : "+"}₦{Number(txn.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs hidden lg:table-cell">{txn.method}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        txn.status === "completed"
                          ? "bg-green-100/30 text-green-700 border-green-200/50"
                          : txn.status === "pending"
                          ? "bg-amber-100/30 text-amber-700 border-amber-200/50"
                          : "bg-red-100/30 text-red-700 border-red-200/50"
                      }`}>
                        {txn.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground hidden xl:table-cell">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => toast({
                            title: "Transaction Details",
                            description: `Reference: ${txn.reference}\nAmount: ₦${Number(txn.amount).toLocaleString()}\nStatus: ${txn.status.toUpperCase()}`
                          })}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => toast({ title: "More options not yet implemented", description: "This feature is coming soon." })}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
