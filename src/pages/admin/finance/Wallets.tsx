import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Edit, Wallet } from "lucide-react";

interface UserWallet {
  id: string;
  user_id: string;
  username: string;
  balance: number;
  pending: number;
  locked: number;
  status: string;
}

const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    filterWallets();
  }, [searchTerm, wallets]);

  const loadWallets = async () => {
    try {
      setWallets([]);
    } catch (err: any) {
      toast({ title: "Error loading wallets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterWallets = () => {
    let filtered = wallets;
    if (searchTerm) {
      filtered = filtered.filter(
        (w) =>
          w.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredWallets(filtered);
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
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            User Wallets
          </h1>
          <p className="text-muted-foreground mt-1">{filteredWallets.length} wallets</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Search */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-primary/20 focus:border-primary/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Wallets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Username</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">User ID</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Balance</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Pending</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Locked</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.map((wallet, idx) => (
                  <tr
                    key={wallet.id}
                    className={`border-b border-border/20 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{wallet.username}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{wallet.user_id}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold">
                      ₦{Number(wallet.balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-amber-600">
                      ₦{Number(wallet.pending).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-red-600">
                      ₦{Number(wallet.locked).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        wallet.status === "active"
                          ? "bg-green-100/30 text-green-700 border-green-200/50"
                          : "bg-red-100/30 text-red-700 border-red-200/50"
                      }`}>
                        {wallet.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredWallets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto opacity-20 mb-3" />
              <p className="font-medium">No wallets found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallets;
