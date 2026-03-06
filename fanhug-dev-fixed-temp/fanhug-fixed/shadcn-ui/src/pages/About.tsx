import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, TrendingUp, Users, Sparkles, Bell } from 'lucide-react';

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
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the thrill of sports prediction without the risks. FanHug offers a safe, 
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
                  <Shield className="h-6 w-6 text-green-500" />
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
                No more sleepless nights worrying about your picks. Just pure, stress-free fun.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 2: No Impact on Real Games */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
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
                Play-money prediction keeps games pure, fair, and free from the corruption that 
                comes with high-stakes gambling.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 3: Fan Hug Over Fan Duel */}
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

          {/* Benefit 4: Support Clean Sportsmanship */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-green-500/50 transition-colors">
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
                By choosing play-money prediction, you're supporting real sportsmanship and ethics 
                in professional sports. Keep sports integrity intact.
              </p>
              <p className="text-sm text-gray-400">
                When prediction doesn't involve real money that could influence outcomes, athletes 
                can focus on what matters: playing their best and competing fairly.
              </p>
            </CardContent>
          </Card>

          {/* Benefit 5: Wake Up Call */}
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur hover:border-yellow-500/50 transition-colors md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Bell className="h-6 w-6 text-yellow-500" />
                </div>
                A Wake Up Call
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>
                Evil controls the world by dividing us and turning us against one another. Even sports—meant to unite fans—are twisted into arenas of rivalry and greed. Betting is encouraged, games are manipulated, and suffering spreads far beyond the field. It is time to take back control, restore integrity, and return sports to clean, fair competition.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <Button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-black font-bold text-xl px-12 py-8"
          >
            Start Making Picks for Free
          </Button>
          <p className="text-gray-500 text-sm">
            No credit card required. No real money. Just pure fun.
          </p>
        </div>
      </div>
    </div>
  );
}