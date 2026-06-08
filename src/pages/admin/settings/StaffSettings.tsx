import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const StaffSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Staff & Roles</h2>
        <Button>Add Staff Member</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No staff members configured yet.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
          <Button variant="outline">Manage Roles</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSettings;
