import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";

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
    icon: <BarChart3 className="h-4 w-4" />,
    path: "/admin/dashboard",
  },
  {
    id: "users",
    label: "User Management",
    icon: <Users className="h-4 w-4" />,
    path: "/admin/users",
    children: [
      { id: "users-list", label: "User List", icon: <Users className="h-4 w-4" />, path: "/admin/users/list" },
      { id: "users-kyc", label: "KYC & Verification", icon: <Shield className="h-4 w-4" />, path: "/admin/users/kyc" },
      { id: "users-banned", label: "Banned Users", icon: <AlertTriangle className="h-4 w-4" />, path: "/admin/users/banned" },
      { id: "users-segments", label: "User Segments", icon: <Users2 className="h-4 w-4" />, path: "/admin/users/segments" },
    ],
  },
  {
    id: "sportsbook",
    label: "Sportsbook",
    icon: <Trophy className="h-4 w-4" />,
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
    icon: <Trophy className="h-4 w-4" />,
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
    icon: <Gamepad2 className="h-4 w-4" />,
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
    icon: <DollarSign className="h-4 w-4" />,
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
    icon: <Gift className="h-4 w-4" />,
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
    icon: <AlertTriangle className="h-4 w-4" />,
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
    icon: <FileText className="h-4 w-4" />,
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
    icon: <TrendingUp className="h-4 w-4" />,
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
    icon: <Users2 className="h-4 w-4" />,
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
    icon: <Settings className="h-4 w-4" />,
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
    icon: <Shield className="h-4 w-4" />,
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
    icon: <MessageSquare className="h-4 w-4" />,
    path: "/admin/support",
    children: [
      { id: "support-tickets", label: "Support Tickets", icon: <MessageSquare className="h-4 w-4" />, path: "/admin/support/tickets" },
      { id: "support-chat", label: "Live Chat", icon: <MessageSquare className="h-4 w-4" />, path: "/admin/support/chat" },
      { id: "support-announcements", label: "Announcements", icon: <FileText className="h-4 w-4" />, path: "/admin/support/announcements" },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["dashboard"]));
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`border-r border-border bg-card transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-56" : "w-20"
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          {sidebarOpen && <h2 className="font-display text-lg font-bold">Admin</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-3"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4" />
              {sidebarOpen && <span>Home</span>}
            </Button>

            {adminNavItems.map((item) => (
              <div key={item.id}>
                <Button
                  variant={isModuleActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-between gap-3"
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
                      className={`h-4 w-4 transition-transform ${
                        expandedModules.has(item.id) ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </Button>

                {/* Submenu */}
                {sidebarOpen &&
                  item.children &&
                  expandedModules.has(item.id) && (
                    <div className="ml-6 space-y-1 mt-1">
                      {item.children.map((subItem) => (
                        <Button
                          key={subItem.id}
                          variant={isActive(subItem.path) ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start gap-2 text-xs"
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Admin Control Room</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleString()}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
