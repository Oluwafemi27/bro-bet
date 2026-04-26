import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const GGRReport = () => {
  const mockData = [
    { day: "Mon", ggr: 2400, ngr: 1200, payouts: 1200 },
    { day: "Tue", ggr: 1398, ngr: 921, payouts: 477 },
    { day: "Wed", ggr: 9800, ngr: 5290, payouts: 4510 },
    { day: "Thu", ggr: 3908, ngr: 2000, payouts: 1908 },
    { day: "Fri", ggr: 4800, ngr: 2181, payouts: 2619 },
    { day: "Sat", ggr: 3800, ngr: 2500, payouts: 1300 },
    { day: "Sun", ggr: 4300, ngr: 2100, payouts: 2200 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">GGR Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₦31.8M</p>
              <p className="text-sm text-muted-foreground">Gross Gaming Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">₦16.2M</p>
              <p className="text-sm text-muted-foreground">Net Gaming Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">₦15.6M</p>
              <p className="text-sm text-muted-foreground">Total Payouts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily GGR Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ggr" fill="#3b82f6" name="GGR" />
              <Bar dataKey="ngr" fill="#10b981" name="NGR" />
              <Bar dataKey="payouts" fill="#ef4444" name="Payouts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GGRReport;
