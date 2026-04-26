import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, FileText } from "lucide-react";

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: string;
}

const CMSPages: React.FC = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const mockPages: CmsPage[] = [
        { id: "1", title: "Terms & Conditions", slug: "terms", status: "published", updated_at: new Date().toISOString() },
        { id: "2", title: "Privacy Policy", slug: "privacy", status: "published", updated_at: new Date().toISOString() },
        { id: "3", title: "Responsible Gaming", slug: "responsible-gaming", status: "published", updated_at: new Date().toISOString() },
        { id: "4", title: "FAQ", slug: "faq", status: "draft", updated_at: new Date().toISOString() },
      ];
      setPages(mockPages);
    } catch (err: any) {
      toast({ title: "Error loading pages", variant: "destructive" });
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
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          Pages
        </h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">CMS Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-6">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div>
                  <p className="font-semibold text-foreground">{page.title}</p>
                  <p className="text-xs text-muted-foreground">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                    page.status === "published"
                      ? "bg-green-100/30 text-green-700 border-green-200/50"
                      : "bg-amber-100/30 text-amber-700 border-amber-200/50"
                  }`}>
                    {page.status.toUpperCase()}
                  </span>
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

export default CMSPages;
