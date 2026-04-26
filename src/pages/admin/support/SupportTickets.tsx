import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const SupportTickets = () => {
  const [tickets] = useState([
    {
      id: 1,
      user: "John Doe",
      subject: "Withdrawal not processed",
      status: "open",
      created: new Date(Date.now() - 2 * 60 * 60000),
      priority: "high",
    },
    {
      id: 2,
      user: "Jane Smith",
      subject: "Bet dispute - incorrect odds",
      status: "in_progress",
      created: new Date(Date.now() - 24 * 60 * 60000),
      priority: "medium",
    },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Support Tickets</h2>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">{ticket.user}</p>
                    <p className="text-xs text-muted-foreground">
                      Priority: <span className="font-medium">{ticket.priority.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupportTickets;
