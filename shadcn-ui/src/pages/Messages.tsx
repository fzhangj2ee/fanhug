import { useMessages } from '@/contexts/MessagesContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages, markAsRead, isLoading } = useMessages();
  const isAdmin = user?.email === 'fzhangj2ee@gmail.com';

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <p className="text-gray-400 text-center">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold text-white mb-6">User Messages</h1>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
          <p className="text-gray-400 text-center">No messages yet</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-white mb-6">User Messages</h1>
      
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 hover:bg-gray-800">
              <TableHead className="text-gray-300">User</TableHead>
              <TableHead className="text-gray-300">Timestamp</TableHead>
              <TableHead className="text-gray-300">Message</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} className="border-gray-800">
                <TableCell className="text-gray-300">
                  <div>
                    <div className="font-medium">{message.user_name}</div>
                    <div className="text-sm text-gray-500">{message.user_email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">
                  {formatTimestamp(message.created_at)}
                </TableCell>
                <TableCell className="text-gray-300 max-w-md">
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={message.read ? 'secondary' : 'default'}
                    className={message.read ? 'bg-gray-600' : 'bg-blue-600'}
                  >
                    {message.read ? 'Read' : 'Unread'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!message.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(message.id)}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Mark as Read
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}