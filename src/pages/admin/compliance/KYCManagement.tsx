import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, FileX, Eye, Loader2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const KYCManagement: React.FC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("kyc_documents")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      toast({ title: "Error loading KYC documents", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();

    const channel = supabase
      .channel("kyc-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kyc_documents" },
        () => {
          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id: string, userId: string) => {
    try {
      const { error: docError } = await supabase
        .from("kyc_documents")
        .update({ status: "approved", verified_at: new Date().toISOString() })
        .eq("id", id);
      
      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ kyc_status: "verified" })
        .eq("id", userId);
      
      if (profileError) throw profileError;

      toast({ title: "Document approved and user verified" });
    } catch (err: any) {
      toast({ title: "Error approving document", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string, userId: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;

    try {
      const { error: docError } = await supabase
        .from("kyc_documents")
        .update({ status: "rejected", rejected_reason: reason })
        .eq("id", id);
      
      if (docError) throw docError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ kyc_status: "rejected" })
        .eq("id", userId);
      
      if (profileError) throw profileError;

      toast({ title: "Document rejected" });
    } catch (err: any) {
      toast({ title: "Error rejecting document", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminPageShell
      title="KYC Management"
      description="Review and verify user identity documents."
    >
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Pending KYC Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/30">
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Document Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Submitted</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, idx) => (
                    <tr
                      key={doc.id}
                      className={`border-b border-border/20 transition-colors duration-200 ${
                        idx % 2 === 0 ? "bg-background/50" : "bg-background"
                      } hover:bg-primary/5`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{doc.profiles?.full_name || "Unknown User"}</div>
                        <div className="text-xs text-muted-foreground">{doc.profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium uppercase">{doc.document_type}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          doc.status === "approved"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : doc.status === "pending"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}>
                          {doc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => window.open(doc.document_url, '_blank')}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                          {doc.status === 'pending' && (
                            <>
                              <Button size="sm" variant="default" className="h-8 gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(doc.id, doc.user_id)}>
                                <FileCheck className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(doc.id, doc.user_id)}>
                                <FileX className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {documents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto opacity-20 mb-3" />
                  <p>No KYC documents to review.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
};

export default KYCManagement;
