import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user, loading: authLoading, error: authError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, navigate, searchParams]);

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearError();

    try {
      await signIn(data.email, data.password);
      toast.success('Login successful!');
      
      // Navigation is handled by the useEffect above
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome Back"
      description="Sign in to your account to continue"
      error={authError || undefined}
    >
      {/* Social Login Buttons */}
      <SocialLoginButtons mode="login" />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-[#2a2d2f]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1a1d1f] px-2 text-[#b1bad3]">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
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
            disabled={isLoading || authLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="bg-[#0d0f10] border-[#2a2d2f] text-white placeholder:text-[#5f6368] focus:border-[#53d337] pr-10"
              {...register('password')}
              disabled={isLoading || authLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b1bad3] hover:text-white transition-colors"
              disabled={isLoading || authLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              className="border-[#2a2d2f] data-[state=checked]:bg-[#53d337] data-[state=checked]:border-[#53d337]"
              {...register('rememberMe')}
              disabled={isLoading || authLoading}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-[#b1bad3] cursor-pointer"
            >
              Remember me
            </label>
          </div>
          <Link
            to="/reset-password"
            className="text-sm text-[#53d337] hover:text-[#45b82d] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#53d337] hover:bg-[#45b82d] text-black font-bold h-11"
          disabled={isLoading || authLoading}
        >
          {isLoading || authLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center text-sm text-[#b1bad3]">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-[#53d337] hover:text-[#45b82d] font-medium transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </AuthForm>
  );
}