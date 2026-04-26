import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, TrendingUp } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  status: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const mockCampaigns: Campaign[] = [
        { id: "1", name: "Easter Campaign", start_date: "2024-04-01", end_date: "2024-04-30", budget: 5000000, spent: 3200000, status: "active" },
        { id: "2", name: "VIP Retention", start_date: "2024-04-15", end_date: "2024-05-15", budget: 10000000, spent: 0, status: "active" },
        { id: "3", name: "March Madness", start_date: "2024-03-01", end_date: "2024-03-31", budget: 3000000, spent: 3000000, status: "ended" },
      ];
      setCampaigns(mockCampaigns);
    } catch (err: any) {
      toast({ title: "Error loading campaigns", variant: "destructive" });
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
          <div className="h-10 w-10 rounded-lg bg-purple-100/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          Campaigns
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Promotional Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1.5">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-mono font-bold">₦{campaign.spent.toLocaleString()} / ₦{campaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                    campaign.status === "active"
                      ? "bg-green-100/30 text-green-700 border-green-200/50"
                      : "bg-gray-100/30 text-gray-700 border-gray-200/50"
                  }`}>
                    {campaign.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Campaigns;
