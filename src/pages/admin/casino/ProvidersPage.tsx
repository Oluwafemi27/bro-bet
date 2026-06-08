import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProvidersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Casino Providers</h2>
        <Button>Add Provider</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrated Providers</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No casino providers configured yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvidersPage;
