import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { PlacedBetsProvider } from "@/contexts/PlacedBetsContext";

import Index from "./pages/Index";
import Sports from "./pages/Sports";
import Live from "./pages/Live";
import Virtuals from "./pages/Virtuals";
import Casino from "./pages/Casino";
import Aviator from "./pages/Aviator";
import Basketball from "./pages/Basketball";
import Boxing from "./pages/Boxing";
import WatchLive from "./pages/WatchLive";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Promotions from "./pages/Promotions";
import MyBets from "./pages/MyBets";
import BetHistory from "./pages/BetHistory";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

import { AdminLayout } from "./components/admin/AdminLayout";

// Admin Dashboard & Modules
import Dashboard from "./pages/admin/dashboard/Dashboard";

// User Management
import UserList from "./pages/admin/users/UserList";
import UserDetail from "./pages/admin/users/UserDetail";
import BannedUsers from "./pages/admin/users/BannedUsers";
import UserSegments from "./pages/admin/users/UserSegments";

// Sportsbook
import SportsModule from "./pages/admin/sportsbook/SportsModule";
import Leagues from "./pages/admin/sportsbook/Leagues";
import Matches from "./pages/admin/sportsbook/Matches";
import Odds from "./pages/admin/sportsbook/Odds";
import Markets from "./pages/admin/sportsbook/Markets";

// Bets
import AllBets from "./pages/admin/bets/AllBets";
import LiveBets from "./pages/admin/bets/LiveBets";
import SettledBets from "./pages/admin/bets/SettledBets";
import VoidedBets from "./pages/admin/bets/VoidedBets";
import LiabilityBets from "./pages/admin/bets/LiabilityBets";

// Finance
import Deposits from "./pages/admin/finance/Deposits";
import Withdrawals from "./pages/admin/finance/Withdrawals";
import Transactions from "./pages/admin/finance/Transactions";
import Wallets from "./pages/admin/finance/Wallets";
import Reconciliation from "./pages/admin/finance/Reconciliation";

// Bonuses
import PromotionsPage from "./pages/admin/bonuses/PromotionsPage";
import BonusRulesPage from "./pages/admin/bonuses/BonusRulesPage";
import FreebetsPage from "./pages/admin/bonuses/FreebetsPage";
import CampaignsPage from "./pages/admin/bonuses/CampaignsPage";

// Risk
import RiskAlerts from "./pages/admin/risk/RiskAlerts";
import RiskRules from "./pages/admin/risk/RiskRules";
import FraudDetection from "./pages/admin/risk/FraudDetection";
import BettingLimits from "./pages/admin/risk/BettingLimits";

// CMS
import Banners from "./pages/admin/cms/Banners";
import CMSPages from "./pages/admin/cms/Pages";
import AdminNotifications from "./pages/admin/cms/Notifications";

// Reports
import GGRReport from "./pages/admin/reports/GGRReport";
import UsersReport from "./pages/admin/reports/UsersReport";
import SportsReport from "./pages/admin/reports/SportsReport";
import AgentsReport from "./pages/admin/reports/AgentsReport";

// Settings
import GeneralSettings from "./pages/admin/settings/GeneralSettings";
import BettingLimitsSettings from "./pages/admin/settings/BettingLimitsSettings";
import IntegrationsSettings from "./pages/admin/settings/IntegrationsSettings";
import StaffSettings from "./pages/admin/settings/StaffSettings";
import AuditLogsSettings from "./pages/admin/settings/AuditLogsSettings";

// Casino
import ProvidersPage from "./pages/admin/casino/ProvidersPage";
import GamesPage from "./pages/admin/casino/GamesPage";
import RoundsPage from "./pages/admin/casino/RoundsPage";

// Compliance
import KYCPage from "./pages/admin/compliance/KYCPage";
import LogsPage from "./pages/admin/compliance/LogsPage";
import RGPage from "./pages/admin/compliance/RGPage";
import ExclusionsPage from "./pages/admin/compliance/ExclusionsPage";

// Agents
import ListPage from "./pages/admin/agents/ListPage";
import CommissionsPage from "./pages/admin/agents/CommissionsPage";
import PlayersPage from "./pages/admin/agents/PlayersPage";

// Support
import TicketsPage from "./pages/admin/support/TicketsPage";
import ChatPage from "./pages/admin/support/ChatPage";
import AnnouncementsPage from "./pages/admin/support/AnnouncementsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PlacedBetsProvider>
            <BetSlipProvider>
              <Routes>
                {/* Main Website Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/live" element={<Live />} />
                <Route path="/virtuals" element={<Virtuals />} />
                <Route path="/casino" element={<Casino />} />
                <Route path="/aviator" element={<Aviator />} />
                <Route path="/basketball" element={<Basketball />} />
                <Route path="/boxing" element={<Boxing />} />
                <Route path="/watch" element={<WatchLive />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<Account />} />
                <Route path="/dashboard" element={<Account />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/my-bets" element={<MyBets />} />
                <Route path="/bet-history" element={<BetHistory />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />

                {/* Unified Admin Panel Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* User Management */}
                  <Route path="users/list" element={<UserList />} />
                  <Route path="users/:id" element={<UserDetail />} />
                  <Route path="users/banned" element={<BannedUsers />} />
                  <Route path="users/segments" element={<UserSegments />} />

                  {/* Sportsbook Management */}
                  <Route path="sportsbook/sports" element={<SportsModule />} />
                  <Route path="sportsbook/leagues" element={<Leagues />} />
                  <Route path="sportsbook/matches" element={<Matches />} />
                  <Route path="sportsbook/odds" element={<Odds />} />
                  <Route path="sportsbook/markets" element={<Markets />} />

                  {/* Bet Management */}
                  <Route path="bets/all" element={<AllBets />} />
                  <Route path="bets/live" element={<LiveBets />} />
                  <Route path="bets/settled" element={<SettledBets />} />
                  <Route path="bets/voided" element={<VoidedBets />} />
                  <Route path="bets/liability" element={<LiabilityBets />} />

                  {/* Finance Management */}
                  <Route path="finance/deposits" element={<Deposits />} />
                  <Route path="finance/withdrawals" element={<Withdrawals />} />
                  <Route path="finance/transactions" element={<Transactions />} />
                  <Route path="finance/wallets" element={<Wallets />} />
                  <Route path="finance/reconciliation" element={<Reconciliation />} />

                  {/* Casino Management */}
                  <Route path="casino/providers" element={<ProvidersPage />} />
                  <Route path="casino/games" element={<GamesPage />} />
                  <Route path="casino/rounds" element={<RoundsPage />} />

                  {/* Bonuses & Promotions */}
                  <Route path="bonuses/promotions" element={<PromotionsPage />} />
                  <Route path="bonuses/rules" element={<BonusRulesPage />} />
                  <Route path="bonuses/freebets" element={<FreebetsPage />} />
                  <Route path="bonuses/campaigns" element={<CampaignsPage />} />

                  {/* Risk & Fraud */}
                  <Route path="risk/alerts" element={<RiskAlerts />} />
                  <Route path="risk/rules" element={<RiskRules />} />
                  <Route path="risk/fraud" element={<FraudDetection />} />
                  <Route path="risk/limits" element={<BettingLimits />} />

                  {/* Content Management */}
                  <Route path="cms/banners" element={<Banners />} />
                  <Route path="cms/pages" element={<CMSPages />} />
                  <Route path="cms/notifications" element={<AdminNotifications />} />

                  {/* Reports & Analytics */}
                  <Route path="reports/ggr" element={<GGRReport />} />
                  <Route path="reports/users" element={<UsersReport />} />
                  <Route path="reports/sports" element={<SportsReport />} />
                  <Route path="reports/agents" element={<AgentsReport />} />

                  {/* Agents & Affiliates */}
                  <Route path="agents/list" element={<ListPage />} />
                  <Route path="agents/commissions" element={<CommissionsPage />} />
                  <Route path="agents/players" element={<PlayersPage />} />

                  {/* Settings */}
                  <Route path="settings/general" element={<GeneralSettings />} />
                  <Route path="settings/limits" element={<BettingLimitsSettings />} />
                  <Route path="settings/integrations" element={<IntegrationsSettings />} />
                  <Route path="settings/staff" element={<StaffSettings />} />
                  <Route path="settings/logs" element={<AuditLogsSettings />} />

                  {/* Compliance */}
                  <Route path="compliance/kyc" element={<KYCPage />} />
                  <Route path="compliance/logs" element={<LogsPage />} />
                  <Route path="compliance/rg" element={<RGPage />} />
                  <Route path="compliance/exclusions" element={<ExclusionsPage />} />

                  {/* Support */}
                  <Route path="support/tickets" element={<TicketsPage />} />
                  <Route path="support/chat" element={<ChatPage />} />
                  <Route path="support/announcements" element={<AnnouncementsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BetSlipProvider>
          </PlacedBetsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
