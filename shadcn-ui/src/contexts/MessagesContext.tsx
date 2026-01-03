import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Message {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface MessagesContextType {
  messages: Message[];
  unreadCount: number;
  sendMessage: (content: string) => Promise<boolean>;
  markAsRead: (messageId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  isLoading: boolean;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.email === 'admin@fanhug.com';

  // Load messages
  const refreshMessages = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please login to send a message');
      return false;
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return false;
    }

    if (content.length > 500) {
      toast.error('Message is too long (max 500 characters)');
      return false;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        user_id: user.id,
        user_email: user.email || 'Unknown',
        user_name: user.user_metadata?.name || user.email || 'Anonymous',
        content: content.trim(),
      });

      if (error) throw error;

      toast.success('Message sent successfully!');
      await refreshMessages();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Load messages on mount and set up real-time subscription
  useEffect(() => {
    if (user) {
      refreshMessages();

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          () => {
            refreshMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const unreadCount = messages.filter(msg => !msg.read).length;

  const value = {
    messages,
    unreadCount,
    sendMessage,
    markAsRead,
    refreshMessages,
    isLoading,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}