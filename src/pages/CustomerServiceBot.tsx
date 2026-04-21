import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, Bot, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  subject: string;
  message: string;
  message_type: string;
  status: string;
  created_at: string;
  replies?: AdminReply[];
}

interface AdminReply {
  id: string;
  reply_message: string;
  created_at: string;
  admin_id: string;
}

const CustomerServiceBot = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [formData, setFormData] = useState({ subject: '', message: '', type: 'enquiry' });
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) {
      loadMessages();
      // Poll for new replies every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;
    try {
      // Load user messages
      const { data: userMsgs, error: msgsError } = await supabase
        .from('user_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (msgsError) throw msgsError;

      // Load replies for each message
      const messagesWithReplies = await Promise.all(
        (userMsgs || []).map(async (msg) => {
          const { data: replies } = await supabase
            .from('admin_replies')
            .select('*')
            .eq('message_id', msg.id)
            .order('created_at', { ascending: true });
          return { ...msg, replies: replies || [] };
        })
      );

      setMessages(messagesWithReplies);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({ title: 'Failed to load messages', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('user_messages')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          message: formData.message,
          message_type: formData.type,
        });

      if (error) throw error;

      toast({ title: 'Message sent successfully! An admin will reply soon.' });
      setFormData({ subject: '', message: '', type: 'enquiry' });
      setShowForm(false);
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <AlertCircle className="h-4 w-4" />;
      case 'support':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (isLoading && !showForm) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-3xl font-bold">Customer Service</h1>
            <p className="text-sm text-muted-foreground">Chat with our support team or speak to an admin</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {showForm ? (
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                    >
                      <option value="enquiry">General Enquiry</option>
                      <option value="complaint">Complaint</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject *</label>
                    <Input
                      placeholder="Enter subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message *</label>
                    <Textarea
                      placeholder="Describe your issue or question..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1 min-h-24"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={sending} className="flex-1">
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No messages yet. Click "New Message" to start chatting!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                          selectedMessage?.id === msg.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-secondary'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{msg.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(msg.status)}`}>
                            {msg.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat view */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(selectedMessage.message_type)}
                      <CardTitle>{selectedMessage.subject}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original message */}
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Your Message:</p>
                  <p className="text-sm">{selectedMessage.message}</p>
                </div>

                {/* Replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Admin Replies:</p>
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply.id} className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm">{reply.reply_message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Waiting for admin response...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Our support team will reply shortly
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Select a message to view the conversation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceBot;
