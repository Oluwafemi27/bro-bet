import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GGRReport = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">GGR Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">₦0.00</p>
              <p className="text-sm text-muted-foreground">Gross Gaming Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">₦0.00</p>
              <p className="text-sm text-muted-foreground">Net Gaming Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">₦0.00</p>
              <p className="text-sm text-muted-foreground">Total Payouts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily GGR Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No data available yet. Gaming revenue will appear here as transactions are processed.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GGRReport;
