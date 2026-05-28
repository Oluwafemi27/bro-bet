import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Wallet, Search, Clock, Shield } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { usePlacedBets } from "@/contexts/PlacedBetsContext";

const Header = () => {
  const { user, profile, isAdmin } = useAuth();
  const { currentBets } = usePlacedBets();
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-sm font-bold text-primary-foreground">NB</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground">NaijaBet</span>
        </Link>

        {showSearch && (
          <div className="absolute left-0 top-14 w-full bg-card p-3 border-b border-border">
            <Input placeholder="Search teams or leagues..." className="bg-secondary" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </button>

          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 bg-amber-600/10 text-amber-600 hover:bg-amber-600 hover:text-white border border-amber-600/20"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Admin</span>
            </Button>
          )}

          {user && profile ? (
            <>
              {currentBets.length > 0 && (
                <Link to="/my-bets" className="relative flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 hover:bg-secondary/80 transition-colors">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{currentBets.length}</span>
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                    {currentBets.length}
                  </span>
                </Link>
              )}
              <Link to="/account" className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">₦{profile.balance.toLocaleString()}</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
