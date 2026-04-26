import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const SportsModule = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="font-display text-2xl font-bold">Sportsbook Management</h2>
      <Button className="gap-2">
        <Plus className="h-4 w-4" /> Add Event
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">0</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">0</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">0</p>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Manage Sports & Odds</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Control odds, margins, and betting limits</p>
      </CardContent>
    </Card>
  </div>
);

export default SportsModule;
