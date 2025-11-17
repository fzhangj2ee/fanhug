import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VocabularyItem, getVocabularyByLevel, getRandomOptions } from '@/data/vocabulary';
import { Star } from 'lucide-react';

interface CharacterQuizProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export default function CharacterQuiz({ level, onComplete, onBack }: CharacterQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<VocabularyItem[]>([]);
  const [options, setOptions] = useState<VocabularyItem[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const levelVocab = getVocabularyByLevel(level);
    const shuffled = [...levelVocab].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    if (shuffled.length > 0) {
      setOptions(getRandomOptions(shuffled[0]));
    }
  }, [level]);

  const handleAnswer = (selectedId: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(selectedId);
    const correct = selectedId === questions[currentQuestion].id;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 20);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setOptions(getRandomOptions(questions[currentQuestion + 1]));
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        onComplete(correct ? score + 20 : score);
      }
    }, 1500);
  };

  if (questions.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const currentWord = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onBack}>← Back</Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level {level}
            </Badge>
            <Badge className="text-lg px-4 py-2 bg-yellow-500">
              <Star className="w-4 h-4 mr-1" />
              {score}
            </Badge>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-xl text-gray-500">Find the Chinese character for:</p>
              <h2 className="text-6xl font-bold text-blue-600">{currentWord.english}</h2>
              <p className="text-2xl text-gray-600">({currentWord.pinyin})</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {options.map((option) => (
                <Button
                  key={option.id}
                  variant={
                    showFeedback && option.id === currentWord.id
                      ? "default"
                      : showFeedback && option.id === selectedAnswer
                      ? "destructive"
                      : "outline"
                  }
                  className={`h-32 text-5xl ${
                    showFeedback && option.id === currentWord.id
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }`}
                  onClick={() => handleAnswer(option.id)}
                  disabled={showFeedback}
                >
                  {option.chinese}
                </Button>
              ))}
            </div>

            {showFeedback && (
              <div className={`text-center text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '🎉 Excellent! You got it!' : '❌ Oops! The correct answer is: ' + currentWord.chinese}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}