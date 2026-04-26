import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Bell, Send } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  recipient: string;
  status: string;
  sent_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const mockNotifications: Notification[] = [
        { id: "1", title: "System Maintenance Alert", message: "Scheduled maintenance on April 26 at 2AM", recipient: "All Users", status: "sent", sent_at: new Date().toISOString() },
        { id: "2", title: "Bonus Available", message: "Your bonus has been credited", recipient: "VIP Users", status: "sent", sent_at: new Date().toISOString() },
        { id: "3", title: "New Payment Method", message: "We now accept cryptocurrency", recipient: "Scheduled", status: "draft", sent_at: new Date().toISOString() },
      ];
      setNotifications(mockNotifications);
    } catch (err: any) {
      toast({ title: "Error loading notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100/20 flex items-center justify-center">
            <Bell className="h-6 w-6 text-orange-600" />
          </div>
          Notifications
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Send Notification
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Push & In-App Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-6">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">Target: {notif.recipient}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold border whitespace-nowrap ${
                    notif.status === "sent"
                      ? "bg-green-100/30 text-green-700 border-green-200/50"
                      : "bg-blue-100/30 text-blue-700 border-blue-200/50"
                  }`}>
                    {notif.status.toUpperCase()}
                  </span>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  {notif.status === "draft" && (
                    <Button size="sm" variant="default" className="h-8 gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
