import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, TrendingUp, Users, Sparkles, Target } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/FanHug.png" 
              alt="FanHug Logo" 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why FanHug? Free Betting Without Real Money
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the thrill of sports betting without the risks. FanHug offers a safe, 
            fun, and ethical way to engage with your favorite sports using play money.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Benefit 1: Remove Stress */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                Remove Stress Watching Games
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>
                Enjoy sports without the anxiety of real money at stake. Watch games for pure 
                entertainment and passion, not financial pressure.
              </p>
              <p className="text-sm text-gray-400">
                No more sleepless nights worrying about your bets. Just pure, stress-free fun.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 2: No Impact on Real Games */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                No Impact on Real Games
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>
                Real money betting, especially large amounts, can influence game outcomes and 
                corrupt the integrity of sports.
              </p>
              <p className="text-sm text-gray-400">
                Play-money betting keeps games pure, fair, and free from the corruption that 
                comes with high-stakes gambling.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 3: Test Your Skills */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                Test Your Skills Before Real Money
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>
                Practice and refine your betting strategies risk-free. See if you can beat the 
                odds before considering real money betting.
              </p>
              <p className="text-sm text-gray-400">
                Learn from mistakes without financial consequences. Even if you win here and 
                decide to bet real money elsewhere, you'll discover that large amounts can 
                impact real games.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 4: Fan Hug Over Fan Duel */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                Fan Hug Over Fan Duel
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>
                We promote community and fun over gambling addiction. Build a supportive 
                community of sports fans who love the game.
              </p>
              <p className="text-sm text-gray-400">
                No pressure, no addiction, just pure fun. We want to see fans hugging, not 
                dueling with their wallets.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 5: Support Clean Sportsmanship */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-green-500" />
                </div>
                Help Professional Players Play Clean Games
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>
                By choosing play-money betting, you're supporting real sportsmanship and ethics 
                in professional sports. Keep sports integrity intact.
              </p>
              <p className="text-sm text-gray-400">
                When betting doesn't involve real money that could influence outcomes, athletes 
                can focus on what matters: playing their best and competing fairly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission Statement */}
        <Card className="border-green-500/30 bg-gray-900/50 mb-12">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Heart className="h-12 w-12 fill-red-500 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                FanHug is committed to providing a safe, fun, and ethical sports betting 
                experience. We believe sports should bring people together, not tear them apart 
                through financial stress and addiction.
              </p>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Join thousands of sports fans who enjoy the thrill of betting without the risks. 
                Test your knowledge, compete with friends, and celebrate the games you love—all 
                with play money that keeps the fun alive and the games clean.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <Button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-black font-bold text-xl px-12 py-8"
          >
            Start Betting for Free
          </Button>
          <p className="text-gray-500 text-sm">
            No credit card required. No real money. Just pure fun.
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-800 pt-8">
          <p>
            FanHug promotes responsible gaming and supports addiction recovery programs.
          </p>
          <p className="mt-2">
            If you or someone you know has a gambling problem, please seek help at{' '}
            <a 
              href="https://www.ncpgambling.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400 underline"
            >
              ncpgambling.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}