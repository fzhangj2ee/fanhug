import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast.error('Failed to complete sign in');
            navigate('/login');
            return;
          }

          if (data.session) {
            toast.success('Successfully signed in with Google!');
            // Redirect to home page
            navigate('/');
          } else {
            toast.error('No session created');
            navigate('/login');
          }
        } else {
          // No tokens in URL, check if there's an existing session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            toast.success('Already signed in!');
            navigate('/');
          } else {
            toast.error('No authentication tokens found');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('An error occurred during sign in');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}