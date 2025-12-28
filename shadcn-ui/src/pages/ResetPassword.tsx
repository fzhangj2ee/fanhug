import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      await resetPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthForm
        title="Check Your Email"
        description="We've sent you a password reset link"
      >
        <div className="text-center space-y-4">
          <div className="bg-[#0d0f10] border border-[#2a2d2f] rounded-lg p-6">
            <p className="text-[#b1bad3] mb-4">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-[#5f6368]">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <Link to="/login">
            <Button
              variant="outline"
              className="w-full border-[#2a2d2f] text-white hover:bg-[#2a2d2f]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Reset Password"
      description="Enter your email to receive a password reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="bg-[#0d0f10] border-[#2a2d2f] text-white placeholder:text-[#5f6368] focus:border-[#53d337]"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#53d337] hover:bg-[#45b82d] text-black font-bold h-11"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      {/* Back to Login Link */}
      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-[#b1bad3] hover:text-white transition-colors inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to Login
        </Link>
      </div>
    </AuthForm>
  );
}