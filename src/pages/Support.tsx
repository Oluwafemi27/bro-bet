import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  Send,
  HelpCircle,
  Shield,
  DollarSign,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    message: "",
  });

  const faqs = [
    {
      category: "Account & Betting",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the Register button in the header, fill in your details, and verify your email. You can start betting immediately after verification.",
        },
        {
          q: "Can I change my username?",
          a: "Currently, usernames cannot be changed after account creation. Contact support if you need to update other account details.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept bank transfers, USSD, card payments, and digital wallets. Check the deposit page for all available options.",
        },
        {
          q: "How long do deposits take?",
          a: "Most deposits are processed instantly. However, some bank transfers may take 1-2 hours depending on your bank.",
        },
      ],
    },
    {
      category: "Withdrawals & Finance",
      questions: [
        {
          q: "When can I withdraw my winnings?",
          a: "You can withdraw your winnings anytime. Withdrawals are processed within 1-24 hours depending on your bank.",
        },
        {
          q: "What's the minimum withdrawal amount?",
          a: "The minimum withdrawal amount is ₦1,000. Maximum withdrawal limits depend on your account verification level.",
        },
        {
          q: "Why was my withdrawal declined?",
          a: "Withdrawals may be declined due to verification issues, suspicious activity, or bank problems. Contact support for assistance.",
        },
        {
          q: "What is the referral bonus?",
          a: "When you refer a friend and they make their first deposit, both of you receive a bonus. Check your referral link in your account.",
        },
      ],
    },
    {
      category: "Responsible Gaming",
      questions: [
        {
          q: "How do I set betting limits?",
          a: "Go to Account → Settings and set your daily, weekly, or monthly betting limits. These cannot be removed immediately.",
        },
        {
          q: "Can I temporarily close my account?",
          a: "Yes, you can self-exclude for 24 hours to 5 years. Contact support or visit your account settings.",
        },
        {
          q: "Where can I find gambling addiction help?",
          a: "We recommend resources like Gamblers Anonymous and NCPG. These services offer free, confidential support.",
        },
        {
          q: "What is your verification process?",
          a: "We verify accounts using ID, proof of address, and payment method verification to ensure security and comply with regulations.",
        },
      ],
    },
    {
      category: "Technical Issues",
      questions: [
        {
          q: "The app keeps crashing, what should I do?",
          a: "Try clearing your browser cache, disabling ad blockers, or using a different browser. Contact support if the issue persists.",
        },
        {
          q: "I can't log in to my account",
          a: "Click 'Forgot Password' to reset it. If you still can't access your account, contact support with your email.",
        },
        {
          q: "Are my bets secure?",
          a: "Yes, all data is encrypted with industry-standard security. We use SSL certificates and comply with data protection regulations.",
        },
        {
          q: "How do I report a bug?",
          a: "Use the Support form below to report any technical issues. Include details about what happened and your device info.",
        },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user?.id,
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
        status: "open",
      });

      if (error) throw error;

      toast({ title: "Support ticket submitted successfully!" });
      setFormData({ subject: "", category: "general", message: "" });
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast({
        title: "Failed to submit support ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground mt-2">
            Find answers and get support from our team
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Support</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    support@naijabet.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Response within 24 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available 9 AM - 9 PM
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Call Support</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    +234 (0) XXX XXX XXXX
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mon - Sun, 9 AM - 9 PM
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => navigate("/account")}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Deposits & Withdrawals</h3>
                  <p className="text-sm text-muted-foreground">Manage your wallet</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => navigate("/promotions")}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-3">
                  <AlertCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Promotions</h3>
                  <p className="text-sm text-muted-foreground">View current offers</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => navigate("/account")}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">Security & preferences</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => navigate("/settings")}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-500/10 p-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Betting Limits</h3>
                  <p className="text-sm text-muted-foreground">Responsible gaming</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((section) => (
              <div key={section.category} className="space-y-2">
                <h3 className="font-semibold text-sm mt-4 first:mt-0">
                  {section.category}
                </h3>
                {section.questions.map((faq, idx) => (
                  <Collapsible key={idx}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary p-4 hover:bg-secondary/80 transition-colors">
                      <span className="font-medium text-sm text-left">
                        {faq.q}
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-4 px-4 text-sm text-muted-foreground">
                      {faq.a}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General Inquiry</option>
                  <option value="account">Account Issues</option>
                  <option value="payment">Payment Issues</option>
                  <option value="technical">Technical Issues</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide details about your issue..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Support Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-semibold">System Status: Operational</p>
                <p className="text-sm text-muted-foreground">
                  All services are running normally
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Support;
