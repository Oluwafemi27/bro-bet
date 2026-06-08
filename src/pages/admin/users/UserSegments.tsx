import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserSegments = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateSegment = () => {
    toast({ title: "Create Segment dialog not yet implemented", description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">User Segments</h2>
        <Button className="gap-2" onClick={handleCreateSegment}>
          <Plus className="h-4 w-4" /> Create Segment
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage User Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create targeted user groups for promotions and analytics</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSegments;
