import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Home } from 'lucide-react';

interface GameCompleteProps {
  score: number;
  level: number;
  gameMode: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function GameComplete({ score, level, gameMode, onPlayAgain, onHome }: GameCompleteProps) {
  const getStars = () => {
    if (score >= 80) return 3;
    if (score >= 60) return 2;
    return 1;
  };

  const getMessage = () => {
    if (score >= 80) return "Outstanding! You're a Chinese learning superstar! 🌟";
    if (score >= 60) return "Great job! Keep practicing and you'll be perfect! 💪";
    return "Good effort! Practice makes perfect! 📚";
  };

  const stars = getStars();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-24 h-24 text-yellow-500 animate-bounce" />
          </div>
          <CardTitle className="text-4xl font-bold text-purple-600">
            Level Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-16 h-16 ${
                    i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="space-y-2">
              <Badge className="text-2xl px-6 py-3 bg-purple-500">
                Score: {score} / 100
              </Badge>
              <p className="text-xl text-gray-600">
                {gameMode} - Level {level}
              </p>
            </div>

            <p className="text-2xl font-semibold text-purple-600 mt-6">
              {getMessage()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button
              variant="outline"
              className="h-16 text-lg"
              onClick={onHome}
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
            <Button
              className="h-16 text-lg bg-purple-600 hover:bg-purple-700"
              onClick={onPlayAgain}
            >
              Play Again
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            {score >= 80 && level < 5 && (
              <p className="text-green-600 font-semibold">
                🎉 You've unlocked Level {level + 1}!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}