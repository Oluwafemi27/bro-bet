import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AnnouncementsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Announcements</h2>
        <Button>Create Announcement</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Announcements</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No announcements created yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsPage;
