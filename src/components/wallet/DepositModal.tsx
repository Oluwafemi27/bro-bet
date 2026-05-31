import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ExternalLink, Copy, Clock } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VirtualAccountInfo {
  accountNumber: string;
  bankName: string;
  accountName: string;
  amount: number;
  expirySeconds: number;
}

export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    let timer: number;
    if (timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 100) {
      toast({
        title: "Invalid amount",
        description: "Minimum deposit is ₦100",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a deposit.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/opay-create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: depositAmount,
          userId: user.id,
          email: user.email,
          fullName: profile?.full_name,
          phone: profile?.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate payment");
      }

      const data = await response.json();

      if (data?.virtualAccount) {
        setVirtualAccount({
          ...data.virtualAccount,
          amount: data.virtualAccount.amount || depositAmount,
        });
        setTimeLeft(1800); // 30 minutes
      } else if (data?.cashierUrl) {
        window.location.href = data.cashierUrl;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error: unknown) {
      console.error("Deposit error details:", error);
      toast({
        title: "Deposit failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setVirtualAccount(null);
        setAmount("");
        setTimeLeft(0);
      }
      onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            {virtualAccount 
              ? "Transfer the exact amount to the virtual account below."
              : "Enter the amount you want to deposit into your wallet via OPay."}
          </DialogDescription>
        </DialogHeader>

        {virtualAccount ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-2xl font-bold text-primary">₦{virtualAccount.amount.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{virtualAccount.bankName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.bankName, "Bank Name")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="text-lg font-mono font-bold">{virtualAccount.accountNumber}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.accountNumber, "Account number")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-medium">{virtualAccount.accountName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.accountName, "Account name")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>
            
            <p className="text-center text-xs text-muted-foreground italic">
              Your balance will be updated automatically once the payment is confirmed.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
              />
              <p className="text-xs text-muted-foreground">Minimum deposit: ₦100</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 5000].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(val.toString())}
                >
                  ₦{val}
                </Button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {!virtualAccount && (
            <Button className="w-full" onClick={handleDeposit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Pay <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
          {virtualAccount && (
            <Button variant="outline" className="w-full" onClick={() => {
              setVirtualAccount(null);
              onClose();
            }}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
