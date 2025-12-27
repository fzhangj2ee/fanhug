import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (data.session) {
          toast.success('Successfully signed in with Google!');
          navigate('/', { replace: true });
        } else {
          toast.error('No session found. Please try again.');
          navigate('/login');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        toast.error('An unexpected error occurred. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0d0f10] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#53d337] mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
        <p className="text-[#b1bad3] text-sm mt-2">Please wait while we authenticate you</p>
      </div>
    </div>
  );
}