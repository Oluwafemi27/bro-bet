import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Gift, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

const PromotionsModule = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (err: any) {
      toast({ title: "Error loading promotions", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      if (editingPromo) {
        const { error } = await supabase
          .from("promotions")
          .update(formData)
          .eq("id", editingPromo.id);
        if (error) throw error;
        toast({ title: "Promotion updated" });
      } else {
        const { error } = await supabase.from("promotions").insert([formData]);
        if (error) throw error;
        toast({ title: "Promotion created" });
      }
      setShowPromoForm(false);
      setEditingPromo(null);
      setFormData({ title: "", description: "", image_url: "", is_active: true });
      loadPromotions();
    } catch (err: any) {
      toast({ title: "Error saving promotion", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const togglePromo = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("promotions")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      loadPromotions();
      toast({ title: `Promotion ${!isActive ? "activated" : "deactivated"}` });
    } catch (err: any) {
      toast({ title: "Error toggling promotion", description: err.message, variant: "destructive" });
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Promotion deleted" });
      loadPromotions();
    } catch (err: any) {
      toast({ title: "Error deleting promotion", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title,
      description: promo.description || "",
      image_url: promo.image_url || "",
      is_active: promo.is_active,
    });
    setShowPromoForm(true);
  };

  return (
    <AdminPageShell
      title="Promotions Management"
      description="Create and manage marketing promotions and bonuses."
      actions={
        <Button onClick={() => setShowPromoForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Promotion
        </Button>
      }
    >
      {showPromoForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>{editingPromo ? "Edit Promotion" : "Create New Promotion"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="e.g., 100% Welcome Bonus"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  placeholder="https://example.com/promo.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Details about the promotion..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPromo ? "Update Promotion" : "Create Promotion"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPromoForm(false);
                  setEditingPromo(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {promotions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Gift className="h-12 w-12 opacity-20 mb-4" />
                <p>No promotions found</p>
              </CardContent>
            </Card>
          ) : (
            promotions.map((promo) => (
              <Card key={promo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {promo.image_url ? (
                        <img
                          src={promo.image_url}
                          alt={promo.title}
                          className="h-16 w-16 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Gift className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{promo.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
                          {promo.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              promo.is_active
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {promo.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Created: {new Date(promo.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <div className="flex items-center gap-2 mr-2">
                        <Switch
                          checked={promo.is_active}
                          onCheckedChange={() => togglePromo(promo.id, promo.is_active)}
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => startEdit(promo)}>
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deletePromotion(promo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </AdminPageShell>
  );
};

export default PromotionsModule;
