# Chinese Learning Game - MVP Todo List

## Files to Create/Modify:

1. **index.html** - Update title to "学中文 - Learn Chinese Game"

2. **src/pages/Index.tsx** - Main game page with:
   - Welcome screen with game title and start button
   - Game mode selection (Vocabulary Match, Character Quiz, Sentence Builder)
   - Level selection (5 levels)
   - Score display and progress tracking

3. **src/components/VocabularyGame.tsx** - Vocabulary matching game:
   - Display Chinese character with pinyin
   - Multiple choice answers in English
   - Audio pronunciation (text-to-speech simulation)
   - Visual feedback for correct/incorrect answers

4. **src/components/CharacterQuiz.tsx** - Character recognition quiz:
   - Show English word
   - Select correct Chinese character from options
   - Progressive difficulty

5. **src/components/SentenceBuilder.tsx** - Sentence building exercise:
   - Drag and drop Chinese words to form sentences
   - Translation hints
   - Validation feedback

6. **src/data/vocabulary.ts** - Vocabulary database:
   - Intermediate level words (animals, food, daily activities, family)
   - Structure: { chinese, pinyin, english, category, level }

7. **src/components/ProgressTracker.tsx** - Progress display:
   - Stars earned
   - Current level
   - Points system
   - Encouraging messages

8. **src/components/GameComplete.tsx** - Completion screen:
   - Celebration animation
   - Summary of performance
   - Option to replay or advance

## Implementation Strategy:
- Keep it simple with localStorage for progress tracking
- Use shadcn-ui components (Button, Card, Badge, Progress)
- Colorful, child-friendly design with Tailwind CSS
- Responsive layout for tablets and computers
- Maximum 8 code files (within limit)