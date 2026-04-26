import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Bet {
  id: string;
  booking_code: string;
  stake: number;
  potential_win: number;
  status: string;
  created_at: string;
  user_id: string;
}

const BetsAll: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadBets();
  }, []);

  useEffect(() => {
    filterBets();
  }, [searchTerm, bets]);

  const loadBets = async () => {
    try {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setBets(data || []);
    } catch (err: any) {
      toast({ title: "Error loading bets", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterBets = () => {
    let filtered = bets;
    if (searchTerm) {
      filtered = filtered.filter((b) =>
        b.booking_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredBets(filtered);
  };

  if (loading) {
    return <div>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 mb-4 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">All Bets</h2>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bets ({filteredBets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">Booking Code</th>
                  <th className="p-3 font-medium">Stake</th>
                  <th className="p-3 font-medium">Potential Win</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Created</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="p-3 font-mono">{bet.booking_code}</td>
                    <td className="p-3">₦{Number(bet.stake).toFixed(2)}</td>
                    <td className="p-3">₦{Number(bet.potential_win).toFixed(2)}</td>
                    <td className="p-3">
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
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
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

export default BetsAll;
