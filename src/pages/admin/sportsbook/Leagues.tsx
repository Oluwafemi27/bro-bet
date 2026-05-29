import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Edit, Trash2, Plus, Trophy } from "lucide-react";

interface League {
  id: string;
  name: string;
  sport: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

const Leagues: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    filterLeagues();
  }, [searchTerm, leagues]);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leagues")
        .select(`
          *,
          sports (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedLeagues = data.map((l: any) => ({
        ...l,
        sport: l.sports?.name || "Unknown"
      }));

      setLeagues(formattedLeagues);
    } catch (err: any) {
      toast({ title: "Error loading leagues", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("leagues-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leagues" },
        () => {
          loadLeagues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this league?")) return;
    try {
      const { error } = await supabase.from("leagues").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "League deleted successfully" });
      loadLeagues();
    } catch (err: any) {
      toast({ title: "Error deleting league", description: err.message, variant: "destructive" });
    }
  };

  const filterLeagues = () => {
    let filtered = leagues;
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredLeagues(filtered);
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
            <div className="h-10 w-10 rounded-lg bg-purple-100/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            Leagues
          </h1>
          <p className="text-muted-foreground mt-1">{filteredLeagues.length} leagues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New League
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leagues by name or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-primary/20 focus:border-primary/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leagues Table */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Leagues List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">League Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Sport</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Country</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Created</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeagues.map((league, idx) => (
                  <tr
                    key={league.id}
                    className={`border-b border-border/20 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-background/50" : "bg-background"
                    } hover:bg-primary/5`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{league.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{league.sport}</td>
                    <td className="px-6 py-4 text-muted-foreground">{league.country}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        league.is_active
                          ? "bg-green-100/30 text-green-700 border-green-200/50"
                          : "bg-red-100/30 text-red-700 border-red-200/50"
                      }`}>
                        {league.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(league.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleDelete(league.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLeagues.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto opacity-20 mb-3" />
              <p className="font-medium">No leagues found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leagues;
