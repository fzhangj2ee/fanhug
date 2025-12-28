import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword, error, loading, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      
      console.log('Sending password reset email to:', email);
      await resetPassword(email);
      
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f10] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1a1d1f] border-[#2a2d2f]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-[#b1bad3] text-center">
            {emailSent
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive a password reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          {emailSent ? (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Password reset email sent to {email}
                </AlertDescription>
              </Alert>
              
              <p className="text-[#b1bad3] text-sm text-center">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#53d337] hover:bg-[#45b82d] text-black font-bold"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full border-[#2a2d2f] bg-[#0d0f10] text-white hover:bg-[#2a2d2f]"
                >
                  Send Another Email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#b1bad3]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#0d0f10] border-[#2a2d2f] text-white placeholder:text-[#b1bad3]"
                    disabled={isSubmitting || loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#53d337] hover:bg-[#45b82d] text-black font-bold"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center text-sm text-[#b1bad3]">
                Remember your password?{' '}
                <Link to="/login" className="text-[#53d337] hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}