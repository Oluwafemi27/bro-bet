import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BannedUsers = () => (
  <div className="space-y-6">
    <h2 className="font-display text-2xl font-bold">Banned Users</h2>
    <Card>
      <CardHeader>
        <CardTitle>Manage Banned Users</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Feature coming soon</p>
      </CardContent>
    </Card>
  </div>
);

export default BannedUsers;
