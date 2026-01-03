import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMessages } from '@/contexts/MessagesContext';
import { Send } from 'lucide-react';

export function MessageForm({ onSuccess }: { onSuccess?: () => void }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendMessage } = useMessages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    const success = await sendMessage(content);
    setIsSubmitting(false);

    if (success) {
      setContent('');
      onSuccess?.();
    }
  };

  const remainingChars = 500 - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message to admin..."
          className="min-h-[150px] resize-none"
          maxLength={500}
        />
        <div className="text-sm text-muted-foreground mt-1 text-right">
          {remainingChars} characters remaining
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting || !content.trim()}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}