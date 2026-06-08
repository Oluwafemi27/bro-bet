import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Edit, Plus, Grid3x3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Market {
  id: string;
  name: string;
  sport: string;
  match_count: number;
  min_stake: number;
  max_stake: number;
  enabled: boolean;
}

const Markets: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMarkets();
  }, []);

  useEffect(() => {
    filterMarkets();
  }, [searchTerm, statusFilter, markets]);

  const loadMarkets = async () => {
    try {
      setMarkets([]);
    } catch (err: any) {
      toast({ title: "Error loading markets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterMarkets = () => {
    let filtered = markets;
    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) =>
        statusFilter === "enabled" ? m.enabled : !m.enabled
      );
    }
    setFilteredMarkets(filtered);
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
            <div className="h-10 w-10 rounded-lg bg-cyan-100/20 flex items-center justify-center">
              <Grid3x3 className="h-6 w-6 text-cyan-600" />
            </div>
            Markets
          </h1>
          <p className="text-muted-foreground mt-1">Manage betting markets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Market
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-primary/20 focus:border-primary/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 border-primary/20 focus:border-primary/40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Betting Markets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Market Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Sport</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Matches</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Min/Max Stake</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map((market, idx) => (
                  <tr
                    key={market.id}
                    className={`border-b border-border/20 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{market.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{market.sport}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="text-xs font-mono bg-secondary/30 px-2 py-1 rounded">
                        {market.match_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      ₦{Number(market.min_stake).toLocaleString()} - ₦{Number(market.max_stake).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        market.enabled
                          ? "bg-green-100/30 text-green-700 border-green-200/50"
                          : "bg-red-100/30 text-red-700 border-red-200/50"
                      }`}>
                        {market.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMarkets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Grid3x3 className="h-12 w-12 mx-auto opacity-20 mb-3" />
              <p className="font-medium">No markets found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Markets;
