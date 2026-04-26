import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Gamepad2 } from "lucide-react";

const CasinoGames = () => {
  const [games] = useState([
    { id: 1, name: "Blackjack", provider: "Evolution", enabled: true, rtp: 99.5 },
    { id: 2, name: "Roulette", provider: "Pragmatic", enabled: true, rtp: 97.3 },
    { id: 3, name: "Baccarat", provider: "Evolution", enabled: false, rtp: 98.6 },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Casino Games</h2>

      <Card>
        <CardHeader>
          <CardTitle>Manage Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {games.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{game.name}</p>
                    <p className="text-sm text-muted-foreground">Provider: {game.provider} • RTP: {game.rtp}%</p>
                  </div>
                </div>
                <Switch checked={game.enabled} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CasinoGames;
