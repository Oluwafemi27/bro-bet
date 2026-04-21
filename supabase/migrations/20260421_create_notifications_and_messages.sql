-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'broadcast', 'support', 'reply')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages/enquiries table
CREATE TABLE IF NOT EXISTS public.user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'enquiry' CHECK (message_type IN ('enquiry', 'complaint', 'support', 'feedback')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin replies table
CREATE TABLE IF NOT EXISTS public.admin_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.user_messages(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create broadcast messages table for admin to send to all/specific users
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_users TEXT[] DEFAULT ARRAY[]::TEXT[], -- Empty means all users, or specific user IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can read their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_messages
CREATE POLICY "Users can read their own messages" ON public.user_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" ON public.user_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all messages" ON public.user_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update messages" ON public.user_messages
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_replies
CREATE POLICY "Users can read replies to their messages" ON public.admin_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_messages
      WHERE user_messages.id = admin_replies.message_id
      AND user_messages.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create replies" ON public.admin_replies
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all replies" ON public.admin_replies
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for broadcast_messages
CREATE POLICY "Admins can read broadcast messages" ON public.broadcast_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR admin_id = auth.uid());

CREATE POLICY "Admins can create broadcast messages" ON public.broadcast_messages
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update broadcast messages" ON public.broadcast_messages
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_user_messages_user_id ON public.user_messages(user_id);
CREATE INDEX idx_user_messages_status ON public.user_messages(status);
CREATE INDEX idx_admin_replies_message_id ON public.admin_replies(message_id);
CREATE INDEX idx_broadcast_messages_admin_id ON public.broadcast_messages(admin_id);
