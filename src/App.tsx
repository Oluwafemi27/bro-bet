import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import Admin from "./pages/Admin";
import AdminPanel from "./pages/AdminPanel";
import MyBets from "./pages/MyBets";
import BetHistory from "./pages/BetHistory";
import Setup from "./pages/Setup";
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";

// Admin Dashboard & Modules
import Dashboard from "./pages/admin/dashboard/Dashboard";

// User Management
import UserList from "./pages/admin/users/UserList";
import KycManagement from "./pages/admin/users/KycManagement";
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
                <Route path="/admin" element={<Admin />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/my-bets" element={<MyBets />} />
                <Route path="/bet-history" element={<BetHistory />} />

                {/* Admin Panel Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminPanel>
                      <Dashboard />
                    </AdminPanel>
                  }
                />

                {/* User Management */}
                <Route
                  path="/admin/users/list"
                  element={
                    <AdminPanel>
                      <UserList />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/users/kyc"
                  element={
                    <AdminPanel>
                      <KycManagement />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/users/banned"
                  element={
                    <AdminPanel>
                      <BannedUsers />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/users/segments"
                  element={
                    <AdminPanel>
                      <UserSegments />
                    </AdminPanel>
                  }
                />

                {/* Sportsbook Management */}
                <Route
                  path="/admin/sportsbook/sports"
                  element={
                    <AdminPanel>
                      <SportsModule />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/sportsbook/leagues"
                  element={
                    <AdminPanel>
                      <Leagues />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/sportsbook/matches"
                  element={
                    <AdminPanel>
                      <Matches />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/sportsbook/odds"
                  element={
                    <AdminPanel>
                      <Odds />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/sportsbook/markets"
                  element={
                    <AdminPanel>
                      <Markets />
                    </AdminPanel>
                  }
                />

                {/* Bet Management */}
                <Route
                  path="/admin/bets/all"
                  element={
                    <AdminPanel>
                      <BetsAll />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bets/live"
                  element={
                    <AdminPanel>
                      <BetsAll />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bets/settled"
                  element={
                    <AdminPanel>
                      <BetsAll />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bets/voided"
                  element={
                    <AdminPanel>
                      <BetsAll />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bets/liability"
                  element={
                    <AdminPanel>
                      <BetsAll />
                    </AdminPanel>
                  }
                />

                {/* Finance Management */}
                <Route
                  path="/admin/finance/deposits"
                  element={
                    <AdminPanel>
                      <Deposits />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/finance/withdrawals"
                  element={
                    <AdminPanel>
                      <Withdrawals />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/finance/transactions"
                  element={
                    <AdminPanel>
                      <Transactions />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/finance/wallets"
                  element={
                    <AdminPanel>
                      <Wallets />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/finance/reconciliation"
                  element={
                    <AdminPanel>
                      <Reconciliation />
                    </AdminPanel>
                  }
                />

                {/* Casino Management */}
                <Route
                  path="/admin/casino/providers"
                  element={
                    <AdminPanel>
                      <CasinoGames />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/casino/games"
                  element={
                    <AdminPanel>
                      <CasinoGames />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/casino/rounds"
                  element={
                    <AdminPanel>
                      <CasinoGames />
                    </AdminPanel>
                  }
                />

                {/* Bonuses & Promotions */}
                <Route
                  path="/admin/bonuses/promotions"
                  element={
                    <AdminPanel>
                      <PromotionsModule />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bonuses/rules"
                  element={
                    <AdminPanel>
                      <PromotionsModule />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bonuses/freebets"
                  element={
                    <AdminPanel>
                      <PromotionsModule />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/bonuses/campaigns"
                  element={
                    <AdminPanel>
                      <PromotionsModule />
                    </AdminPanel>
                  }
                />

                {/* Risk & Fraud */}
                <Route
                  path="/admin/risk/alerts"
                  element={
                    <AdminPanel>
                      <RiskAlerts />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/risk/rules"
                  element={
                    <AdminPanel>
                      <RiskRules />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/risk/fraud"
                  element={
                    <AdminPanel>
                      <FraudDetection />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/risk/limits"
                  element={
                    <AdminPanel>
                      <BettingLimits />
                    </AdminPanel>
                  }
                />

                {/* Content Management */}
                <Route
                  path="/admin/cms/banners"
                  element={
                    <AdminPanel>
                      <Banners />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/cms/pages"
                  element={
                    <AdminPanel>
                      <CMSPages />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/cms/notifications"
                  element={
                    <AdminPanel>
                      <Notifications />
                    </AdminPanel>
                  }
                />

                {/* Reports & Analytics */}
                <Route
                  path="/admin/reports/ggr"
                  element={
                    <AdminPanel>
                      <GGRReport />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/reports/users"
                  element={
                    <AdminPanel>
                      <GGRReport />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/reports/sports"
                  element={
                    <AdminPanel>
                      <GGRReport />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/reports/agents"
                  element={
                    <AdminPanel>
                      <GGRReport />
                    </AdminPanel>
                  }
                />

                {/* Agents & Affiliates */}
                <Route
                  path="/admin/agents/list"
                  element={
                    <AdminPanel>
                      <UserList />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/agents/commissions"
                  element={
                    <AdminPanel>
                      <UserList />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/agents/players"
                  element={
                    <AdminPanel>
                      <UserList />
                    </AdminPanel>
                  }
                />

                {/* Settings */}
                <Route
                  path="/admin/settings/general"
                  element={
                    <AdminPanel>
                      <GeneralSettings />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/settings/limits"
                  element={
                    <AdminPanel>
                      <GeneralSettings />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/settings/integrations"
                  element={
                    <AdminPanel>
                      <GeneralSettings />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/settings/staff"
                  element={
                    <AdminPanel>
                      <GeneralSettings />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/settings/logs"
                  element={
                    <AdminPanel>
                      <GeneralSettings />
                    </AdminPanel>
                  }
                />

                {/* Compliance */}
                <Route
                  path="/admin/compliance/logs"
                  element={
                    <AdminPanel>
                      <ResponsibleGaming />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/compliance/rg"
                  element={
                    <AdminPanel>
                      <ResponsibleGaming />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/compliance/exclusions"
                  element={
                    <AdminPanel>
                      <ResponsibleGaming />
                    </AdminPanel>
                  }
                />

                {/* Support */}
                <Route
                  path="/admin/support/tickets"
                  element={
                    <AdminPanel>
                      <SupportTickets />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/support/chat"
                  element={
                    <AdminPanel>
                      <SupportTickets />
                    </AdminPanel>
                  }
                />
                <Route
                  path="/admin/support/announcements"
                  element={
                    <AdminPanel>
                      <SupportTickets />
                    </AdminPanel>
                  }
                />

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
