import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, RotateCcw } from 'lucide-react';

interface Sentence {
  words: string[];
  translation: string;
  hint: string;
}

interface SentenceBuilderProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const sentences: Record<number, Sentence[]> = {
  1: [
    { words: ['我', '喜欢', '狗'], translation: 'I like dogs', hint: 'Subject + Verb + Object' },
    { words: ['猫', '很', '可爱'], translation: 'Cats are very cute', hint: 'Subject + Adverb + Adjective' },
  ],
  2: [
    { words: ['我', '吃', '米饭'], translation: 'I eat rice', hint: 'Subject + Verb + Object' },
    { words: ['牛奶', '很', '好喝'], translation: 'Milk is delicious', hint: 'Subject + Adverb + Adjective' },
  ],
  3: [
    { words: ['我的', '妈妈', '很', '好'], translation: 'My mother is very good', hint: 'Possessive + Subject + Adverb + Adjective' },
    { words: ['哥哥', '喜欢', '运动'], translation: 'Brother likes sports', hint: 'Subject + Verb + Object' },
  ],
  4: [
    { words: ['我', '每天', '学习'], translation: 'I study every day', hint: 'Subject + Time + Verb' },
    { words: ['他', '喜欢', '看书'], translation: 'He likes reading', hint: 'Subject + Verb + Object' },
  ],
  5: [
    { words: ['我们', '去', '图书馆'], translation: 'We go to the library', hint: 'Subject + Verb + Place' },
    { words: ['学校', '在', '公园', '旁边'], translation: 'The school is next to the park', hint: 'Subject + Verb + Place + Position' },
  ],
};

export default function SentenceBuilder({ level, onComplete, onBack }: SentenceBuilderProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions] = useState<Sentence[]>(sentences[level] || sentences[1]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (questions.length > 0) {
      resetQuestion();
    }
  }, [currentQuestion]);

  const resetQuestion = () => {
    const currentSentence = questions[currentQuestion];
    setAvailableWords([...currentSentence.words].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setShowFeedback(false);
  };

  const handleWordClick = (word: string, fromAvailable: boolean) => {
    if (showFeedback) return;

    if (fromAvailable) {
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter(w => w !== word));
    } else {
      setAvailableWords([...availableWords, word]);
      setSelectedWords(selectedWords.filter(w => w !== word));
    }
  };

  const handleCheck = () => {
    const currentSentence = questions[currentQuestion];
    const correct = selectedWords.join('') === currentSentence.words.join('');
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 20);
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          onComplete(score + 20);
        }
      }, 2000);
    }
  };

  if (questions.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const currentSentence = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
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
              Build the Sentence {currentQuestion + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xl text-gray-600">{currentSentence.translation}</p>
              <p className="text-sm text-gray-500 italic">Hint: {currentSentence.hint}</p>
            </div>

            <div className="min-h-24 bg-blue-50 rounded-lg p-4 border-2 border-dashed border-blue-300">
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedWords.length === 0 ? (
                  <p className="text-gray-400 text-lg">Tap words below to build the sentence</p>
                ) : (
                  selectedWords.map((word, index) => (
                    <Button
                      key={`selected-${index}`}
                      variant="default"
                      className="text-3xl h-16 px-6 bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleWordClick(word, false)}
                    >
                      {word}
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {availableWords.map((word, index) => (
                <Button
                  key={`available-${index}`}
                  variant="outline"
                  className="text-3xl h-16 px-6"
                  onClick={() => handleWordClick(word, true)}
                  disabled={showFeedback}
                >
                  {word}
                </Button>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={resetQuestion}
                disabled={showFeedback}
                className="text-lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleCheck}
                disabled={selectedWords.length === 0 || showFeedback}
                className="text-lg px-8"
              >
                Check Answer
              </Button>
            </div>

            {showFeedback && (
              <div className={`text-center text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '🎉 Perfect! Well done!' : '❌ Try again! Reset and try once more.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}