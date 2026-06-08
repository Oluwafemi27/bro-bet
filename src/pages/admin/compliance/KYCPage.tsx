import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KYCPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">KYC Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No KYC requests at this time.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCPage;
