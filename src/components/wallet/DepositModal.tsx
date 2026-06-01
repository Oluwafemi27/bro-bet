import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Copy, Clock } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VirtualAccountInfo {
  bankAccountNumber: string;
  bankName: string;
  bankAccountName: string;
  amount: string | number;
  expiresIn: number;
}

export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

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

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch(
        'https://wfyisqyqlijmaifunhqv.supabase.co/functions/v1/opay-create-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            userId: user.id,
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email
          })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Deposit failed');

      // Map OPay response fields to the VirtualAccountInfo interface
      setVirtualAccount({
        bankAccountNumber: data.bankAccountNumber,
        bankName: data.bankName,
        bankAccountName: data.bankAccountName,
        amount: data.amount,
        expiresIn: 1800,
      });
      setTimeLeft(1800);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      console.error("Deposit error details:", {
        message: errorMessage,
      });
      toast({
        title: "Deposit failed",
        description: errorMessage,
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
              <p className="text-2xl font-bold text-primary">₦{virtualAccount.amount}</p>
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
                  <p className="text-lg font-mono font-bold">{virtualAccount.bankAccountNumber}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.bankAccountNumber, "Account number")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Account Name</p>
                  <p className="font-medium">{virtualAccount.bankAccountName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.bankAccountName, "Account name")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>
            
            <p className="text-center text-xs text-muted-foreground italic">
              Your wallet will be credited automatically once payment is confirmed
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
// Triggering redeploy
