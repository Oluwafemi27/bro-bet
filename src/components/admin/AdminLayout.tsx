import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Users,
  Trophy,
  Wallet,
  Gamepad2,
  DollarSign,
  Gift,
  AlertTriangle,
  FileText,
  TrendingUp,
  Users2,
  Settings,
  Shield,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Bell,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

const adminNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    path: "/admin/dashboard",
  },
  {
    id: "users",
    label: "User Management",
    icon: <Users className="h-5 w-5" />,
    path: "/admin/users",
    children: [
      { id: "users-list", label: "User List", icon: <Users className="h-4 w-4" />, path: "/admin/users/list" },
      { id: "users-banned", label: "Banned Users", icon: <AlertTriangle className="h-4 w-4" />, path: "/admin/users/banned" },
      { id: "users-segments", label: "User Segments", icon: <Users2 className="h-4 w-4" />, path: "/admin/users/segments" },
    ],
  },
  {
    id: "sportsbook",
    label: "Sportsbook",
    icon: <Trophy className="h-5 w-5" />,
    path: "/admin/sportsbook",
    children: [
      { id: "sports", label: "Sports", icon: <Trophy className="h-4 w-4" />, path: "/admin/sportsbook/sports" },
      { id: "leagues", label: "Leagues", icon: <Trophy className="h-4 w-4" />, path: "/admin/sportsbook/leagues" },
      { id: "matches", label: "Matches", icon: <Trophy className="h-4 w-4" />, path: "/admin/sportsbook/matches" },
      { id: "odds", label: "Odds Control", icon: <Trophy className="h-4 w-4" />, path: "/admin/sportsbook/odds" },
      { id: "markets", label: "Markets", icon: <Trophy className="h-4 w-4" />, path: "/admin/sportsbook/markets" },
    ],
  },
  {
    id: "bets",
    label: "Bet Management",
    icon: <Trophy className="h-5 w-5" />,
    path: "/admin/bets",
    children: [
      { id: "bets-all", label: "All Bets", icon: <Trophy className="h-4 w-4" />, path: "/admin/bets/all" },
      { id: "bets-live", label: "Live Bets", icon: <Trophy className="h-4 w-4" />, path: "/admin/bets/live" },
      { id: "bets-settled", label: "Settled Bets", icon: <Trophy className="h-4 w-4" />, path: "/admin/bets/settled" },
      { id: "bets-voided", label: "Voided Bets", icon: <Trophy className="h-4 w-4" />, path: "/admin/bets/voided" },
      { id: "bets-liability", label: "Liability Report", icon: <TrendingUp className="h-4 w-4" />, path: "/admin/bets/liability" },
    ],
  },
  {
    id: "casino",
    label: "Casino Management",
    icon: <Gamepad2 className="h-5 w-5" />,
    path: "/admin/casino",
    children: [
      { id: "casino-providers", label: "Providers", icon: <Gamepad2 className="h-4 w-4" />, path: "/admin/casino/providers" },
      { id: "casino-games", label: "Games", icon: <Gamepad2 className="h-4 w-4" />, path: "/admin/casino/games" },
      { id: "casino-rounds", label: "Rounds", icon: <Gamepad2 className="h-4 w-4" />, path: "/admin/casino/rounds" },
    ],
  },
  {
    id: "finance",
    label: "Finance & Payments",
    icon: <DollarSign className="h-5 w-5" />,
    path: "/admin/finance",
    children: [
      { id: "finance-deposits", label: "Deposits", icon: <DollarSign className="h-4 w-4" />, path: "/admin/finance/deposits" },
      { id: "finance-withdrawals", label: "Withdrawals", icon: <DollarSign className="h-4 w-4" />, path: "/admin/finance/withdrawals" },
      { id: "finance-transactions", label: "All Transactions", icon: <Wallet className="h-4 w-4" />, path: "/admin/finance/transactions" },
      { id: "finance-wallets", label: "Wallets", icon: <Wallet className="h-4 w-4" />, path: "/admin/finance/wallets" },
      { id: "finance-reconciliation", label: "Reconciliation", icon: <BarChart3 className="h-4 w-4" />, path: "/admin/finance/reconciliation" },
    ],
  },
  {
    id: "bonuses",
    label: "Bonuses & Promotions",
    icon: <Gift className="h-5 w-5" />,
    path: "/admin/bonuses",
    children: [
      { id: "bonuses-promotions", label: "Promotions", icon: <Gift className="h-4 w-4" />, path: "/admin/bonuses/promotions" },
      { id: "bonuses-rules", label: "Bonus Rules", icon: <Gift className="h-4 w-4" />, path: "/admin/bonuses/rules" },
      { id: "bonuses-freebets", label: "Free Bets", icon: <Gift className="h-4 w-4" />, path: "/admin/bonuses/freebets" },
      { id: "bonuses-campaigns", label: "Campaigns", icon: <TrendingUp className="h-4 w-4" />, path: "/admin/bonuses/campaigns" },
    ],
  },
  {
    id: "risk",
    label: "Risk & Fraud",
    icon: <AlertTriangle className="h-5 w-5" />,
    path: "/admin/risk",
    children: [
      { id: "risk-alerts", label: "Risk Alerts", icon: <AlertTriangle className="h-4 w-4" />, path: "/admin/risk/alerts" },
      { id: "risk-rules", label: "Risk Rules", icon: <AlertTriangle className="h-4 w-4" />, path: "/admin/risk/rules" },
      { id: "risk-fraud", label: "Fraud Detection", icon: <Shield className="h-4 w-4" />, path: "/admin/risk/fraud" },
      { id: "risk-limits", label: "Betting Limits", icon: <Wallet className="h-4 w-4" />, path: "/admin/risk/limits" },
    ],
  },
  {
    id: "cms",
    label: "Content Management",
    icon: <FileText className="h-5 w-5" />,
    path: "/admin/cms",
    children: [
      { id: "cms-banners", label: "Banners", icon: <FileText className="h-4 w-4" />, path: "/admin/cms/banners" },
      { id: "cms-pages", label: "Pages", icon: <FileText className="h-4 w-4" />, path: "/admin/cms/pages" },
      { id: "cms-notifications", label: "Notifications", icon: <MessageSquare className="h-4 w-4" />, path: "/admin/cms/notifications" },
    ],
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: <TrendingUp className="h-5 w-5" />,
    path: "/admin/reports",
    children: [
      { id: "reports-ggr", label: "GGR Report", icon: <TrendingUp className="h-4 w-4" />, path: "/admin/reports/ggr" },
      { id: "reports-users", label: "User Analytics", icon: <Users className="h-4 w-4" />, path: "/admin/reports/users" },
      { id: "reports-sports", label: "Sportsbook Report", icon: <Trophy className="h-4 w-4" />, path: "/admin/reports/sports" },
      { id: "reports-agents", label: "Agent Report", icon: <Users2 className="h-4 w-4" />, path: "/admin/reports/agents" },
    ],
  },
  {
    id: "agents",
    label: "Agents & Affiliates",
    icon: <Users2 className="h-5 w-5" />,
    path: "/admin/agents",
    children: [
      { id: "agents-list", label: "Agent List", icon: <Users2 className="h-4 w-4" />, path: "/admin/agents/list" },
      { id: "agents-commissions", label: "Commissions", icon: <DollarSign className="h-4 w-4" />, path: "/admin/agents/commissions" },
      { id: "agents-players", label: "Players", icon: <Users className="h-4 w-4" />, path: "/admin/agents/players" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/admin/settings",
    children: [
      { id: "settings-general", label: "General", icon: <Settings className="h-4 w-4" />, path: "/admin/settings/general" },
      { id: "settings-limits", label: "Betting Limits", icon: <Wallet className="h-4 w-4" />, path: "/admin/settings/limits" },
      { id: "settings-integrations", label: "Integrations", icon: <Settings className="h-4 w-4" />, path: "/admin/settings/integrations" },
      { id: "settings-staff", label: "Staff & Roles", icon: <Users className="h-4 w-4" />, path: "/admin/settings/staff" },
      { id: "settings-logs", label: "Audit Logs", icon: <FileText className="h-4 w-4" />, path: "/admin/settings/logs" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: <Shield className="h-5 w-5" />,
    path: "/admin/compliance",
    children: [
      { id: "compliance-logs", label: "Compliance Logs", icon: <FileText className="h-4 w-4" />, path: "/admin/compliance/logs" },
      { id: "compliance-rg", label: "Responsible Gaming", icon: <Shield className="h-4 w-4" />, path: "/admin/compliance/rg" },
      { id: "compliance-exclusions", label: "Exclusions", icon: <AlertTriangle className="h-4 w-4" />, path: "/admin/compliance/exclusions" },
    ],
  },
  {
    id: "support",
    label: "Support Tools",
    icon: <MessageSquare className="h-5 w-5" />,
    path: "/admin/support",
    children: [
      { id: "support-tickets", label: "Support Tickets", icon: <MessageSquare className="h-4 w-4" />, path: "/admin/support/tickets" },
      { id: "support-chat", label: "Live Chat", icon: <MessageSquare className="h-4 w-4" />, path: "/admin/support/chat" },
      { id: "support-announcements", label: "Announcements", icon: <FileText className="h-4 w-4" />, path: "/admin/support/announcements" },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["dashboard"]));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (!loading && user && !isAdmin) {
      toast({ title: "Access denied - Admin only", variant: "destructive" });
      navigate("/");
      return;
    }
  }, [user, isAdmin, loading, navigate, toast]);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isActive = (path: string) => location.pathname === path;
  const isModuleActive = (modulePath: string) => location.pathname.startsWith(modulePath);

  const getPageTitle = () => {
    const currentItem = adminNavItems.find(item => isModuleActive(item.path));
    if (!currentItem) return "Dashboard";
    
    if (currentItem.children) {
      const subItem = currentItem.children.find(sub => sub.path === location.pathname);
      if (subItem) return subItem.label;
    }
    
    return currentItem.label;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`border-r border-border bg-gradient-to-b from-card to-background transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col shadow-lg`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-6 bg-gradient-to-r from-primary/10 to-primary/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-display text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Admin
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 w-9 hover:bg-primary/10"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-4">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
              className={`w-full justify-start gap-3 h-10 ${location.pathname === "/" ? "bg-primary/20" : "hover:bg-primary/10"}`}
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5" />
              {sidebarOpen && <span className="font-medium">Back to Site</span>}
            </Button>

            {/* Divider */}
            {sidebarOpen && <div className="my-2 h-px bg-border/30" />}

            {adminNavItems.map((item) => (
              <div key={item.id}>
                <Button
                  variant={isModuleActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full justify-between gap-3 h-10 font-medium ${
                    isModuleActive(item.path) ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                  }`}
                  onClick={() => {
                    if (item.children) {
                      toggleModule(item.id);
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {sidebarOpen && item.children && (
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        expandedModules.has(item.id) ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </Button>

                {/* Submenu */}
                {sidebarOpen &&
                  item.children &&
                  expandedModules.has(item.id) && (
                    <div className="ml-2 mt-1 space-y-0.5 pl-2 border-l border-border/30">
                      {item.children.map((subItem) => (
                        <Button
                          key={subItem.id}
                          variant={isActive(subItem.path) ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start gap-2 text-xs h-9 ${
                            isActive(subItem.path) ? "bg-primary" : "hover:bg-primary/10"
                          }`}
                          onClick={() => navigate(subItem.path)}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Profile Section */}
        {sidebarOpen && (
          <div className="border-t border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-background/80">
        {/* Top Header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-8 py-5 flex items-center justify-between shadow-sm">
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-foreground">{getPageTitle()}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-primary/10"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
