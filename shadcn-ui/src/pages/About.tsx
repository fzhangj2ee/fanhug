import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, TrendingUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">About FanHug</h1>
          <p className="text-xl text-gray-300">
            The Future of Sports Prediction - Safe, Fun, and Free
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-lg">
              FanHug is revolutionizing sports prediction by providing a completely free, 
              risk-free platform where fans can enjoy the thrill of predicting game outcomes 
              without the dangers of real-money gambling.
            </p>
            <p className="text-gray-300">
              We believe sports should bring people together, not tear them apart through 
              gambling addiction and financial loss. That's why we created a platform that 
              captures all the excitement of sports prediction while eliminating the risks.
            </p>
          </CardContent>
        </Card>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-6 w-6 text-green-500" />
                100% Safe & Free
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                No real money, no risk, no addiction. Just pure sports prediction fun with 
                virtual currency. Perfect for learning and entertainment without any financial danger.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-6 w-6 text-blue-500" />
                Community Driven
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Join a community of sports fans who love the game. Compete on leaderboards, 
                share strategies, and enjoy friendly competition without the toxic environment 
                of real-money gambling.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-6 w-6 text-purple-500" />
                Real-Time Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Live odds updates, in-game predictions, and instant results. Experience all 
                the excitement of sports prediction with real-time data from professional 
                sports leagues.
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-6 w-6 text-yellow-500" />
                A Wake Up Call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Evil controls the world by dividing us and turning us against one another. Even sports—meant to unite fans—are twisted into arenas of rivalry and greed. Betting is encouraged, games are manipulated, and suffering spreads far beyond the field. It is time to take back control, restore integrity, and return sports to clean, fair competition.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why FanHug Section */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Why Choose FanHug?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-300">
                  <strong className="text-white">Zero Financial Risk:</strong> Never worry about 
                  losing money or developing gambling problems.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-300">
                  <strong className="text-white">Learn & Improve:</strong> Practice your sports 
                  knowledge and prediction skills in a safe environment.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-300">
                  <strong className="text-white">Always Free:</strong> No subscriptions, no hidden 
                  fees, no pressure to spend money.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-300">
                  <strong className="text-white">Family Friendly:</strong> A platform that promotes 
                  healthy sports fandom without the dangers of gambling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-green-500/50 bg-green-500/5 backdrop-blur">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Ready to Get Started?</h3>
            <p className="text-gray-300 text-lg">
              Join thousands of sports fans enjoying risk-free prediction fun!
            </p>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8 py-6"
            >
              Start Making Picks for Free
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}