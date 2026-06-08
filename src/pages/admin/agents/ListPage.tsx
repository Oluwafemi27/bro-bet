import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ListPage = () => {
  const { toast } = useToast();

  const handleAddAgent = () => {
    toast({ title: "Add Agent dialog not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Agents</h2>
        <Button onClick={handleAddAgent}>Add Agent</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent List</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No agents configured yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListPage;
