import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChatPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Support Chat</h2>

      <Card>
        <CardHeader>
          <CardTitle>Live Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <p>No active chat sessions.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;
