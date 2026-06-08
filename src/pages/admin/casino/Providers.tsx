import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Gamepad2 } from "lucide-react";

const Providers: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100/20 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-blue-600" />
          </div>
          Game Providers
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Casino Providers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 text-center text-muted-foreground">
            <p>No providers configured. Add a provider to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Providers;
