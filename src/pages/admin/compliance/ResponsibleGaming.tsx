import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exclusion {
  id: string;
  user_id: string;
  deposit_limit_daily: number | null;
  session_limit_minutes: number | null;
  self_exclusion_until: string | null;
  created_at: string;
}

const ResponsibleGaming = () => {
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadExclusions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("responsible_gaming_limits")
        .select("*")
        .or("self_exclusion_until.not.is.null,deposit_limit_daily.not.is.null,session_limit_minutes.not.is.null");

      if (error) throw error;
      setExclusions(data || []);
    } catch (err: any) {
      toast({ title: "Error loading exclusions", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExclusions();

    const channel = supabase
      .channel("compliance-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "responsible_gaming_limits" },
        () => {
          loadExclusions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Responsible Gaming Compliance</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{exclusions.filter(e => e.self_exclusion_until && new Date(e.self_exclusion_until) > new Date()).length}</p>
              <p className="text-sm text-muted-foreground">Self-Exclusions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{exclusions.filter(e => e.deposit_limit_daily).length}</p>
              <p className="text-sm text-muted-foreground">Deposit Limits Set</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{exclusions.length}</p>
              <p className="text-sm text-muted-foreground">Total Active Controls</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active User Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {exclusions.map((exc) => (
                <div key={exc.id} className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User: {exc.user_id}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {exc.self_exclusion_until && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
                            SELF-EXCLUDED UNTIL {new Date(exc.self_exclusion_until).toLocaleDateString()}
                          </span>
                        )}
                        {exc.deposit_limit_daily && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">
                            DEPOSIT LIMIT: ₦{exc.deposit_limit_daily.toLocaleString()}
                          </span>
                        )}
                        {exc.session_limit_minutes && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                            SESSION LIMIT: {exc.session_limit_minutes} MINS
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
              {exclusions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Shield className="h-12 w-12 mx-auto opacity-20 mb-3" />
                  <p>No active responsible gaming controls found.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsibleGaming;
