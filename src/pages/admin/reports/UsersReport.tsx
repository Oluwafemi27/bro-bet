import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UsersReport = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Users Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">0</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">0</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">0%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>User analytics will appear here when data is available.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersReport;
