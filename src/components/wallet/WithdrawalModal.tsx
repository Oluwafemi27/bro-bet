import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "030", name: "Heritage Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "999992", name: "OPay" },
  { code: "090267", name: "Kuda Bank" },
  { code: "50515", name: "Moniepoint" },
  { code: "999991", name: "Palmpay" },
];

export const WithdrawalModal = ({ isOpen, onClose, balance }: WithdrawalModalProps) => {
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 1000) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal is ₦1,000",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds in your main balance",
        variant: "destructive",
      });
      return;
    }

    if (!bankCode || accountNumber.length !== 10) {
      toast({
        title: "Invalid details",
        description: "Please select a bank and enter a valid 10-digit account number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedBank = NIGERIAN_BANKS.find(b => b.code === bankCode);
      const { data, error } = await supabase.functions.invoke("opay-withdrawal", {
        body: { 
          amount: withdrawalAmount,
          bankCode,
          bankName: selectedBank?.name,
          accountNumber
        },
      });

      if (error) throw error;

      toast({
        title: "Withdrawal initiated",
        description: "Your withdrawal request has been submitted and is being processed.",
      });
      onClose();
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Transfer funds from your wallet to your Nigerian bank account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="w-amount">Amount (₦)</Label>
            <Input
              id="w-amount"
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
            />
            <p className="text-xs text-muted-foreground">Available: ₦{balance.toLocaleString()}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank">Bank</Label>
            <Select onValueChange={setBankCode} value={bankCode}>
              <SelectTrigger id="bank">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {NIGERIAN_BANKS.map((bank) => (
                  <SelectItem key={`${bank.code}-${bank.name}`} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="account">Account Number</Label>
            <Input
              id="account"
              placeholder="10-digit account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleWithdrawal} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Withdraw Funds <ArrowUpCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
