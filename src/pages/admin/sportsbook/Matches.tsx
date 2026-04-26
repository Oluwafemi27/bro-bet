import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Edit, Plus, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  scheduled_time: string;
  status: string;
  odds_locked: boolean;
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [searchTerm, statusFilter, matches]);

  const loadMatches = async () => {
    try {
      const mockMatches: Match[] = [
        { id: "1", league: "Premier League", home_team: "Arsenal", away_team: "Chelsea", scheduled_time: "2024-04-26T15:00:00", status: "upcoming", odds_locked: false },
        { id: "2", league: "Premier League", home_team: "Man City", away_team: "Liverpool", scheduled_time: "2024-04-26T17:30:00", status: "upcoming", odds_locked: false },
        { id: "3", league: "La Liga", home_team: "Barcelona", away_team: "Real Madrid", scheduled_time: "2024-04-27T20:00:00", status: "upcoming", odds_locked: true },
        { id: "4", league: "Serie A", home_team: "Juventus", away_team: "AC Milan", scheduled_time: "2024-04-25T19:00:00", status: "live", odds_locked: true },
      ];
      setMatches(mockMatches);
    } catch (err: any) {
      toast({ title: "Error loading matches", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.away_team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }
    setFilteredMatches(filtered);
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
            <div className="h-10 w-10 rounded-lg bg-blue-100/20 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            Matches
          </h1>
          <p className="text-muted-foreground mt-1">{filteredMatches.length} matches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Match
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
                placeholder="Search matches..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Matches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">League</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Match</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Scheduled</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Odds</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match, idx) => (
                  <tr
                    key={match.id}
                    className={`border-b border-border/20 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground text-xs">{match.league}</td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {match.home_team} vs {match.away_team}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(match.scheduled_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        match.status === "live"
                          ? "bg-red-100/30 text-red-700 border-red-200/50"
                          : match.status === "upcoming"
                          ? "bg-blue-100/30 text-blue-700 border-blue-200/50"
                          : "bg-gray-100/30 text-gray-700 border-gray-200/50"
                      }`}>
                        {match.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        match.odds_locked
                          ? "bg-amber-100/30 text-amber-700 border-amber-200/50"
                          : "bg-green-100/30 text-green-700 border-green-200/50"
                      }`}>
                        {match.odds_locked ? "Locked" : "Open"}
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
          {filteredMatches.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto opacity-20 mb-3" />
              <p className="font-medium">No matches found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Matches;
