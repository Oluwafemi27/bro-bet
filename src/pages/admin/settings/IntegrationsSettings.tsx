import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const IntegrationsSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Integrations</h2>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Gateways</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage payment gateway integrations</p>
            <Button variant="outline">Configure</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SMS Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Configure SMS notifications</p>
            <Button variant="outline">Configure</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Setup email notifications</p>
            <Button variant="outline">Configure</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Connect analytics services</p>
            <Button variant="outline">Configure</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
