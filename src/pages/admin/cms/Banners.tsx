import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Eye, Image } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  views: number;
}

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const mockBanners: Banner[] = [
        { id: "1", title: "Easter Promo - 50% Bonus", start_date: "2024-04-01", end_date: "2024-04-30", status: "active", views: 5240 },
        { id: "2", title: "Summer World Cup Special", start_date: "2024-06-01", end_date: "2024-07-31", status: "scheduled", views: 0 },
        { id: "3", title: "Cash Back Weekend", start_date: "2024-03-15", end_date: "2024-03-31", status: "ended", views: 8921 },
      ];
      setBanners(mockBanners);
    } catch (err: any) {
      toast({ title: "Error loading banners", variant: "destructive" });
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
          <div className="h-10 w-10 rounded-lg bg-cyan-100/20 flex items-center justify-center">
            <Image className="h-6 w-6 text-cyan-600" />
          </div>
          Banners & Sliders
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Banner
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Active Banners</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{banner.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(banner.start_date).toLocaleDateString()} - {new Date(banner.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{banner.views.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                      banner.status === "active"
                        ? "bg-green-100/30 text-green-700 border-green-200/50"
                        : banner.status === "scheduled"
                        ? "bg-blue-100/30 text-blue-700 border-blue-200/50"
                        : "bg-gray-100/30 text-gray-700 border-gray-200/50"
                    }`}>
                      {banner.status.toUpperCase()}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="destructive" className="h-8 gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Banners;
