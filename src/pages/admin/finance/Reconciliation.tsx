import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface ReconciliationReport {
  period: string;
  system_total: number;
  bank_total: number;
  variance: number;
  status: string;
}

const Reconciliation: React.FC = () => {
  const [reports, setReports] = useState<ReconciliationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReconciliation();
  }, []);

  const loadReconciliation = async () => {
    try {
      const mockReports: ReconciliationReport[] = [
        { period: "April 26, 2024", system_total: 5250000, bank_total: 5250000, variance: 0, status: "reconciled" },
        { period: "April 25, 2024", system_total: 3780000, bank_total: 3780000, variance: 0, status: "reconciled" },
        { period: "April 24, 2024", system_total: 4920000, bank_total: 4915000, variance: -5000, status: "variance" },
        { period: "April 23, 2024", system_total: 2100000, bank_total: 2100000, variance: 0, status: "reconciled" },
      ];
      setReports(mockReports);
    } catch (err: any) {
      toast({ title: "Error loading reconciliation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      // Mock reconciliation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Reconciliation completed successfully" });
      loadReconciliation();
    } catch (err: any) {
      toast({ title: "Reconciliation failed", variant: "destructive" });
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Bank Reconciliation</h1>
          <p className="text-muted-foreground mt-1">Match system transactions with bank statements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleReconcile} disabled={reconciling}>
            <RefreshCw className={`h-4 w-4 ${reconciling ? "animate-spin" : ""}`} />
            {reconciling ? "Reconciling..." : "Run Reconciliation"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/50">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">System Balance</p>
            <p className="text-2xl font-bold mt-2">₦{reports[0]?.system_total.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Bank Balance</p>
            <p className="text-2xl font-bold mt-2">₦{reports[0]?.bank_total.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
        <Card className={`border ${reports[0]?.variance === 0 ? "border-green-200/50" : "border-red-200/50"}`}>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Variance</p>
            <p className={`text-2xl font-bold mt-2 ${reports[0]?.variance === 0 ? "text-green-600" : "text-red-600"}`}>
              ₦{Math.abs(reports[0]?.variance || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation History */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Reconciliation History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {reports.map((report, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {report.status === "reconciled" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{report.period}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>System: ₦{report.system_total.toLocaleString()}</span>
                        <span>Bank: ₦{report.bank_total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-mono font-bold ${report.variance === 0 ? "text-green-600" : "text-red-600"}`}>
                      {report.variance > 0 ? "+" : ""}{report.variance === 0 ? "✓" : report.variance}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                      report.status === "reconciled"
                        ? "bg-green-100/30 text-green-700 border-green-200/50"
                        : "bg-amber-100/30 text-amber-700 border-amber-200/50"
                    }`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border border-blue-200/50 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Reconciliation Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>1. Download your bank statement for the period</p>
          <p>2. Verify all transactions match between system and bank</p>
          <p>3. Investigate any variances immediately</p>
          <p>4. Mark as reconciled once verified and variance is resolved</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
