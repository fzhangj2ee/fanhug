import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/contexts/MessagesContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function MessageHistory() {
  const { user } = useAuth();
  const { getUserMessages } = useMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    console.log('Loading messages for user:', user.id);
    setLoading(true);
    
    try {
      const data = await getUserMessages(user.id);
      console.log('Fetched messages:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [user]);

  if (loading) {
    return <p className="text-gray-400 text-center py-4">Loading messages...</p>;
  }

  if (messages.length === 0) {
    return <p className="text-gray-400 text-center py-4">No messages sent yet</p>;
  }

  return (
    <>
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 hover:bg-gray-800">
              <TableHead className="w-12 text-gray-300"></TableHead>
              <TableHead className="text-gray-300">Date & Time</TableHead>
              <TableHead className="text-gray-300">Message Preview</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow
                key={message.id}
                className="cursor-pointer hover:bg-gray-800 border-gray-700"
                onClick={() => setSelectedMessage(message)}
              >
                <TableCell>
                  {message.read ? (
                    <MailOpen className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Mail className="w-4 h-4 text-blue-500" />
                  )}
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(message.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}{' '}
                  {new Date(message.created_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </TableCell>
                <TableCell className="max-w-xs truncate text-gray-300">
                  {message.content.substring(0, 50)}
                  {message.content.length > 50 ? '...' : ''}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={message.read ? 'secondary' : 'default'} 
                    className={message.read ? 'bg-gray-600' : 'bg-blue-600'}
                  >
                    {message.read ? 'Read' : 'Unread'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Message Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Sent:</div>
              <div className="text-white">
                {selectedMessage && new Date(selectedMessage.created_at).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Status:</div>
              <Badge 
                variant={selectedMessage?.read ? 'secondary' : 'default'} 
                className={selectedMessage?.read ? 'bg-gray-600' : 'bg-blue-600'}
              >
                {selectedMessage?.read ? 'Read by Admin' : 'Unread'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-400">Message:</div>
              <div className="text-white whitespace-pre-wrap mt-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
                {selectedMessage?.content}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}