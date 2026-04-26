import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  children: React.ReactNode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      const checkAdminAccess = async () => {
        try {
          const { data, error } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });

          if (error) {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .eq("role", "admin")
              .limit(1);

            if (!roleData || roleData.length === 0) {
              toast({ title: "Access denied - Admin only", variant: "destructive" });
              navigate("/");
              return;
            }
          } else if (!data) {
            toast({ title: "Access denied - Admin only", variant: "destructive" });
            navigate("/");
            return;
          }
        } catch (err) {
          console.error("Admin check failed:", err);
        }
      };

      checkAdminAccess();
    }
  }, [user, loading, navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminPanel;
