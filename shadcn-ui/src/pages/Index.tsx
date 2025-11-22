import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, CreditCard, CheckCircle, ArrowRight, Lock, Globe } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handlePayNow = () => {
    if (isAuthenticated) {
      navigate('/payment');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PayApp
            </h1>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/signup')}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              Secure & Fast Payments
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Simple Payments,
            <br />
            Powerful Results
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience seamless payment processing with enterprise-grade security. Start with just $1 and see the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handlePayNow} className="text-lg px-8 py-6">
              <CreditCard className="mr-2 h-5 w-5" />
              Pay $1 Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose PayApp?</h2>
          <p className="text-xl text-muted-foreground">Everything you need for secure online payments</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Bank-Level Security</CardTitle>
              <CardDescription>
                Your payments are protected with industry-standard encryption and security protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Process payments in seconds with our optimized infrastructure and instant confirmations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Multiple Login Options</CardTitle>
              <CardDescription>
                Sign in with email or use your favorite social accounts for quick access
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join thousands of users who trust PayApp for their payment needs. Start with just $1 today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-6"
                >
                  Create Free Account
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePayNow}
                  className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  Make a Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="flex justify-center mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">PCI Compliant</h3>
            <p className="text-sm text-muted-foreground">Industry standard security</p>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">256-bit SSL</h3>
            <p className="text-sm text-muted-foreground">End-to-end encryption</p>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Fraud Protection</h3>
            <p className="text-sm text-muted-foreground">Advanced detection system</p>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <CreditCard className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Stripe Powered</h3>
            <p className="text-sm text-muted-foreground">Trusted by millions</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 PayApp. All rights reserved.</p>
            <p className="text-sm mt-2">Powered by Stripe • Built with React & shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  );
}