import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RGPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Responsible Gaming</h2>

      <Card>
        <CardHeader>
          <CardTitle>RG Policies</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No responsible gaming policies configured.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RGPage;
