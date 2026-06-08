import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Banners: React.FC = () => {
  const { toast } = useToast();

  const handleNewBanner = () => {
    toast({ title: "New Banner dialog not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-100/20 flex items-center justify-center">
            <Image className="h-6 w-6 text-cyan-600" />
          </div>
          Banners & Sliders
        </h1>
        <Button className="gap-2" onClick={handleNewBanner}>
          <Plus className="h-4 w-4" />
          New Banner
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Active Banners</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 text-center text-muted-foreground">
            <p>No banners created yet. Add one to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Banners;
