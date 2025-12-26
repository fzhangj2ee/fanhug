import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The Supabase client will automatically handle the OAuth callback
    // and update the auth state. We just need to redirect to the home page.
    const handleCallback = async () => {
      try {
        // Give Supabase a moment to process the callback
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        toast.success('Successfully logged in!');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f10]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#53d337] mx-auto mb-4" />
        <p className="text-[#b1bad3]">Completing authentication...</p>
      </div>
    </div>
  );
}