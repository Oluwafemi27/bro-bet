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
      setPages([]);
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
        <Button
          className="gap-2"
          onClick={() => toast({ title: "New Page dialog not yet implemented", description: "This feature is coming soon." })}
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">CMS Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 text-center text-muted-foreground">
            {pages.length === 0 ? (
              <p>No pages created yet. Add one to get started.</p>
            ) : (
              <div className="space-y-2">
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => toast({ title: "Edit Page dialog not yet implemented", description: "This feature is coming soon." })}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 gap-1.5"
                        onClick={() => toast({ title: "Delete Page not yet implemented", description: "This feature is coming soon." })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSPages;
