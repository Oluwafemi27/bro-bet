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
import NotFound from "./pages/NotFound";

import { AdminLayout } from "./components/admin/AdminLayout";

// Admin Dashboard & Modules
import Dashboard from "./pages/admin/dashboard/Dashboard";

// User Management
import UserList from "./pages/admin/users/UserList";
import BannedUsers from "./pages/admin/users/BannedUsers";
import UserSegments from "./pages/admin/users/UserSegments";

// Sportsbook
import SportsModule from "./pages/admin/sportsbook/SportsModule";
import Leagues from "./pages/admin/sportsbook/Leagues";
import Matches from "./pages/admin/sportsbook/Matches";
import Odds from "./pages/admin/sportsbook/Odds";
import Markets from "./pages/admin/sportsbook/Markets";

// Bets
import BetsAll from "./pages/admin/bets/BetsAll";

// Finance
import Deposits from "./pages/admin/finance/Deposits";
import Withdrawals from "./pages/admin/finance/Withdrawals";
import Transactions from "./pages/admin/finance/Transactions";
import Wallets from "./pages/admin/finance/Wallets";
import Reconciliation from "./pages/admin/finance/Reconciliation";

// Bonuses
import PromotionsModule from "./pages/admin/bonuses/PromotionsModule";
import BonusRules from "./pages/admin/bonuses/BonusRules";
import Freebets from "./pages/admin/bonuses/Freebets";
import Campaigns from "./pages/admin/bonuses/Campaigns";

// Risk
import RiskAlerts from "./pages/admin/risk/RiskAlerts";
import RiskRules from "./pages/admin/risk/RiskRules";
import FraudDetection from "./pages/admin/risk/FraudDetection";
import BettingLimits from "./pages/admin/risk/BettingLimits";

// CMS
import Banners from "./pages/admin/cms/Banners";
import CMSPages from "./pages/admin/cms/Pages";
import Notifications from "./pages/admin/cms/Notifications";

// Reports
import GGRReport from "./pages/admin/reports/GGRReport";

// Settings
import GeneralSettings from "./pages/admin/settings/GeneralSettings";

// Casino
import CasinoGames from "./pages/admin/casino/CasinoGames";
import Providers from "./pages/admin/casino/Providers";

// Compliance
import ResponsibleGaming from "./pages/admin/compliance/ResponsibleGaming";

// Support
import SupportTickets from "./pages/admin/support/SupportTickets";

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

                {/* Legacy Admin Redirect */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Unified Admin Panel Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* User Management */}
                  <Route path="users/list" element={<UserList />} />
                  <Route path="users/banned" element={<BannedUsers />} />
                  <Route path="users/segments" element={<UserSegments />} />

                  {/* Sportsbook Management */}
                  <Route path="sportsbook/sports" element={<SportsModule />} />
                  <Route path="sportsbook/leagues" element={<Leagues />} />
                  <Route path="sportsbook/matches" element={<Matches />} />
                  <Route path="sportsbook/odds" element={<Odds />} />
                  <Route path="sportsbook/markets" element={<Markets />} />

                  {/* Bet Management */}
                  <Route path="bets/all" element={<BetsAll />} />
                  <Route path="bets/live" element={<BetsAll />} />
                  <Route path="bets/settled" element={<BetsAll />} />
                  <Route path="bets/voided" element={<BetsAll />} />
                  <Route path="bets/liability" element={<BetsAll />} />

                  {/* Finance Management */}
                  <Route path="finance/deposits" element={<Deposits />} />
                  <Route path="finance/withdrawals" element={<Withdrawals />} />
                  <Route path="finance/transactions" element={<Transactions />} />
                  <Route path="finance/wallets" element={<Wallets />} />
                  <Route path="finance/reconciliation" element={<Reconciliation />} />

                  {/* Casino Management */}
                  <Route path="casino/providers" element={<CasinoGames />} />
                  <Route path="casino/games" element={<CasinoGames />} />
                  <Route path="casino/rounds" element={<CasinoGames />} />

                  {/* Bonuses & Promotions */}
                  <Route path="bonuses/promotions" element={<PromotionsModule />} />
                  <Route path="bonuses/rules" element={<PromotionsModule />} />
                  <Route path="bonuses/freebets" element={<PromotionsModule />} />
                  <Route path="bonuses/campaigns" element={<PromotionsModule />} />

                  {/* Risk & Fraud */}
                  <Route path="risk/alerts" element={<RiskAlerts />} />
                  <Route path="risk/rules" element={<RiskRules />} />
                  <Route path="risk/fraud" element={<FraudDetection />} />
                  <Route path="risk/limits" element={<BettingLimits />} />

                  {/* Content Management */}
                  <Route path="cms/banners" element={<Banners />} />
                  <Route path="cms/pages" element={<CMSPages />} />
                  <Route path="cms/notifications" element={<Notifications />} />

                  {/* Reports & Analytics */}
                  <Route path="reports/ggr" element={<GGRReport />} />
                  <Route path="reports/users" element={<GGRReport />} />
                  <Route path="reports/sports" element={<GGRReport />} />
                  <Route path="reports/agents" element={<GGRReport />} />

                  {/* Agents & Affiliates */}
                  <Route path="agents/list" element={<UserList />} />
                  <Route path="agents/commissions" element={<UserList />} />
                  <Route path="agents/players" element={<UserList />} />

                  {/* Settings */}
                  <Route path="settings/general" element={<GeneralSettings />} />
                  <Route path="settings/limits" element={<GeneralSettings />} />
                  <Route path="settings/integrations" element={<GeneralSettings />} />
                  <Route path="settings/staff" element={<GeneralSettings />} />
                  <Route path="settings/logs" element={<GeneralSettings />} />

                  {/* Compliance */}
                  <Route path="compliance/logs" element={<ResponsibleGaming />} />
                  <Route path="compliance/rg" element={<ResponsibleGaming />} />
                  <Route path="compliance/exclusions" element={<ResponsibleGaming />} />

                  {/* Support */}
                  <Route path="support/tickets" element={<SupportTickets />} />
                  <Route path="support/chat" element={<SupportTickets />} />
                  <Route path="support/announcements" element={<SupportTickets />} />
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
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
