import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading, error: authError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const password = watch('password', '');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    clearError();

    try {
      await signUp(data.email, data.password, {
        fullName: data.name,
      });
      
      toast.success('Account created successfully! Please check your email to verify your account.');
      
      // Wait a moment before redirecting to show the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create Account"
      description="Sign up to start betting on your favorite sports"
      error={authError || undefined}
    >
      {/* Social Signup Buttons */}
      <SocialLoginButtons mode="signup" />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-[#2a2d2f]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1a1d1f] px-2 text-[#b1bad3]">Or sign up with email</span>
        </div>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Full Name <span className="text-[#5f6368] text-xs">(Optional)</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="bg-[#0d0f10] border-[#2a2d2f] text-white placeholder:text-[#5f6368] focus:border-[#53d337]"
            {...register('name')}
            disabled={isLoading || authLoading}
          />
        </div>

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
              placeholder="Create a strong password"
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
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#b1bad3]">Password strength:</span>
                <span className={`text-xs font-medium ${
                  passwordStrength < 50 ? 'text-red-400' : 
                  passwordStrength < 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {getPasswordStrengthLabel()}
                </span>
              </div>
              <Progress 
                value={passwordStrength} 
                className={`h-1 ${getPasswordStrengthColor()}`}
              />
              
              {/* Password Requirements */}
              <div className="space-y-1 pt-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                    ) : (
                      <XCircle className="h-3 w-3 text-[#5f6368]" />
                    )}
                    <span className={req.met ? 'text-green-400' : 'text-[#5f6368]'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="bg-[#0d0f10] border-[#2a2d2f] text-white placeholder:text-[#5f6368] focus:border-[#53d337] pr-10"
              {...register('confirmPassword')}
              disabled={isLoading || authLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b1bad3] hover:text-white transition-colors"
              disabled={isLoading || authLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-[#2a2d2f] data-[state=checked]:bg-[#53d337] data-[state=checked]:border-[#53d337] mt-0.5"
                  disabled={isLoading || authLoading}
                />
              )}
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm text-[#b1bad3] leading-tight cursor-pointer"
            >
              I agree to the{' '}
              <Link to="/terms" className="text-[#53d337] hover:text-[#45b82d]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#53d337] hover:text-[#45b82d]">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-400">{errors.acceptTerms.message}</p>
          )}
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Login Link */}
      <div className="text-center text-sm text-[#b1bad3]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#53d337] hover:text-[#45b82d] font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
    </AuthForm>
  );
}