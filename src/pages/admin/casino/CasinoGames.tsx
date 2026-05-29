import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Gamepad2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CasinoGame {
  id: string;
  title: string;
  category: string;
  provider: string;
  is_active: boolean;
  image_url: string;
}

const CasinoGames = () => {
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("casino_games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (err: any) {
      toast({ title: "Error loading games", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();

    const channel = supabase
      .channel("casino-games-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "casino_games" },
        () => {
          loadGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleGameStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("casino_games")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: `Game ${!currentStatus ? 'enabled' : 'disabled'} successfully` });
      // Realtime will update the list
    } catch (err: any) {
      toast({ title: "Error updating game", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Casino Games</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Game
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Games ({games.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {game.image_url ? (
                      <img src={game.image_url} alt={game.title} className="h-12 w-12 rounded-md object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                        <Gamepad2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{game.title}</p>
                      <p className="text-sm text-muted-foreground">{game.provider} • {game.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${game.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {game.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <Switch 
                      checked={game.is_active} 
                      onCheckedChange={() => toggleGameStatus(game.id, game.is_active)}
                    />
                  </div>
                </div>
              ))}
              {games.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Gamepad2 className="h-12 w-12 mx-auto opacity-20 mb-3" />
                  <p>No games found in the database.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CasinoGames;
