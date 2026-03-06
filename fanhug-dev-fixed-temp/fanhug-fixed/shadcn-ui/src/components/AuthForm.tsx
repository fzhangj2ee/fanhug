import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthFormProps {
  title: string;
  description: string;
  children: ReactNode;
  error?: string;
  success?: string;
}

export default function AuthForm({ title, description, children, error, success }: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f10] p-4">
      <Card className="w-full max-w-md bg-[#1a1d1f] border-[#2a2d2f]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
          <CardDescription className="text-[#b1bad3]">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {children}
        </CardContent>
      </Card>
    </div>
  );
}