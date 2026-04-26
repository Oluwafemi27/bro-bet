import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface KycRequest {
  id: string;
  user_id: string;
  user_name: string;
  status: "pending" | "approved" | "rejected";
  document_type: string;
  submitted_at: string;
  reviewed_at?: string;
}

const KycManagement: React.FC = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadKycRequests();
  }, []);

  const loadKycRequests = async () => {
    try {
      // Mock KYC data - would fetch from database
      const mockRequests: KycRequest[] = [
        {
          id: "1",
          user_id: "user1",
          user_name: "John Doe",
          status: "pending",
          document_type: "National ID",
          submitted_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_id: "user2",
          user_name: "Jane Smith",
          status: "pending",
          document_type: "Passport",
          submitted_at: new Date().toISOString(),
        },
      ];
      setKycRequests(mockRequests);
    } catch (err: any) {
      toast({ title: "Error loading KYC requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approveKyc = async (id: string) => {
    try {
      toast({ title: "KYC approved successfully" });
      loadKycRequests();
    } catch (err: any) {
      toast({ title: "Error approving KYC", variant: "destructive" });
    }
  };

  const rejectKyc = async (id: string) => {
    try {
      toast({ title: "KYC rejected" });
      loadKycRequests();
    } catch (err: any) {
      toast({ title: "Error rejecting KYC", variant: "destructive" });
    }
  };

  if (loading) {
    return <div>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 mb-4 w-full" />)}</div>;
  }

  const pendingRequests = kycRequests.filter((r) => r.status === "pending");
  const approvedRequests = kycRequests.filter((r) => r.status === "approved");
  const rejectedRequests = kycRequests.filter((r) => r.status === "rejected");

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">KYC Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending KYC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending KYC Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{req.user_name}</p>
                  <p className="text-sm text-muted-foreground">{req.document_type}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveKyc(req.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => rejectKyc(req.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No pending KYC requests</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KycManagement;
