import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, MessageSquare, Lock } from 'lucide-react';
import VocabularyGame from '@/components/VocabularyGame';
import CharacterQuiz from '@/components/CharacterQuiz';
import SentenceBuilder from '@/components/SentenceBuilder';
import GameComplete from '@/components/GameComplete';

type GameMode = 'vocabulary' | 'character' | 'sentence' | null;
type Screen = 'home' | 'mode-select' | 'level-select' | 'game' | 'complete';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('home');
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('chineseLearningProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      setUnlockedLevels(progress.unlockedLevels || 1);
    }
  }, []);

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    
    if (score >= 80 && selectedLevel === unlockedLevels && unlockedLevels < 5) {
      const newUnlocked = unlockedLevels + 1;
      setUnlockedLevels(newUnlocked);
      localStorage.setItem('chineseLearningProgress', JSON.stringify({ unlockedLevels: newUnlocked }));
    }
    
    setScreen('complete');
  };

  const handlePlayAgain = () => {
    setScreen('mode-select');
  };

  const handleHome = () => {
    setScreen('home');
    setGameMode(null);
  };

  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setScreen('level-select');
  };

  const selectLevel = (level: number) => {
    setSelectedLevel(level);
    setScreen('game');
  };

  if (screen === 'game' && gameMode) {
    const GameComponent = 
      gameMode === 'vocabulary' ? VocabularyGame :
      gameMode === 'character' ? CharacterQuiz :
      SentenceBuilder;

    return (
      <GameComponent
        level={selectedLevel}
        onComplete={handleGameComplete}
        onBack={() => setScreen('level-select')}
      />
    );
  }

  if (screen === 'complete') {
    return (
      <GameComplete
        score={finalScore}
        level={selectedLevel}
        gameMode={
          gameMode === 'vocabulary' ? 'Vocabulary Match' :
          gameMode === 'character' ? 'Character Quiz' :
          'Sentence Builder'
        }
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    );
  }

  if (screen === 'level-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => setScreen('mode-select')} className="mb-6">
            ← Back
          </Button>
          
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-3xl">Select Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={level <= unlockedLevels ? "default" : "outline"}
                    disabled={level > unlockedLevels}
                    className="h-32 text-4xl font-bold relative"
                    onClick={() => selectLevel(level)}
                  >
                    {level > unlockedLevels ? (
                      <Lock className="w-12 h-12" />
                    ) : (
                      level
                    )}
                    {level <= unlockedLevels && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        Unlocked
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-center text-gray-600 mt-6">
                Score 80+ to unlock the next level!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (screen === 'mode-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={handleHome} className="mb-6">
            ← Back
          </Button>
          
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-3xl">Choose Game Mode</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-400"
                onClick={() => selectMode('vocabulary')}
              >
                <CardHeader>
                  <BookOpen className="w-16 h-16 mx-auto text-purple-600" />
                  <CardTitle className="text-center text-xl">Vocabulary Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Match Chinese characters with their English meanings
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-400"
                onClick={() => selectMode('character')}
              >
                <CardHeader>
                  <Brain className="w-16 h-16 mx-auto text-blue-600" />
                  <CardTitle className="text-center text-xl">Character Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Find the correct Chinese character for English words
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-400"
                onClick={() => selectMode('sentence')}
              >
                <CardHeader>
                  <MessageSquare className="w-16 h-16 mx-auto text-green-600" />
                  <CardTitle className="text-center text-xl">Sentence Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Build Chinese sentences by arranging words
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="text-7xl">🎓</div>
          <CardTitle className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            学中文
          </CardTitle>
          <p className="text-3xl text-gray-600">Learn Chinese</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xl text-gray-700">
              Fun games to help you learn Chinese step-by-step!
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level {unlockedLevels} Unlocked
            </Badge>
          </div>

          <Button 
            className="w-full h-16 text-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => setScreen('mode-select')}
          >
            Start Learning! 开始学习!
          </Button>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm text-gray-600">25+ Words</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎮</div>
              <p className="text-sm text-gray-600">3 Game Modes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm text-gray-600">5 Levels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}