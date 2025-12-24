# Sports Betting Platform - Development Plan

## Design Guidelines

### Design References
- **DraftKings.com**: Professional sports betting interface, dark theme
- **FanDuel.com**: Clean layouts, emphasis on live odds
- **Style**: Modern Dark Theme + Sports Betting UI + Real-time Updates

### Color Palette
- Primary: #0F1419 (Deep Black - background)
- Secondary: #1C2128 (Dark Gray - cards/sections)
- Accent: #00C853 (Success Green - winning bets)
- Danger: #FF3B30 (Red - losing bets)
- Warning: #FFB800 (Gold - pending bets)
- Text: #FFFFFF (White), #8B949E (Gray - secondary)

### Typography
- Heading1: Inter font-weight 700 (36px)
- Heading2: Inter font-weight 600 (28px)
- Heading3: Inter font-weight 600 (20px)
- Body: Inter font-weight 400 (14px)
- Numbers/Odds: Roboto Mono font-weight 500 (16px) - for betting odds display

### Key Component Styles
- Buttons: Green accent (#00C853), white text, 6px rounded, hover: brighten 10%
- Cards: Dark gray (#1C2128), 1px border (#2A2F36), 8px rounded
- Odds Display: Monospace font, bold, color-coded (positive/negative)
- Live Indicator: Pulsing red dot for live games

### Layout & Spacing
- Hero section: Sports carousel with live games
- Betting grid: 3 columns desktop, 2 tablet, 1 mobile, 16px gaps
- Section padding: 60px vertical
- Card hover: Subtle lift with green glow, 200ms transition

### Images to Generate
1. **hero-sports-stadium.jpg** - Modern sports stadium at night with bright lights (Style: photorealistic, dramatic)
2. **basketball-action.jpg** - NBA basketball game action shot (Style: photorealistic, high energy)
3. **football-game.jpg** - NFL football game with players (Style: photorealistic, intense)
4. **soccer-match.jpg** - Soccer match with crowd (Style: photorealistic, vibrant)
5. **baseball-stadium.jpg** - Baseball stadium during game (Style: photorealistic, classic)
6. **logo-betting.png** - Sports betting logo with modern design (Style: vector-style, professional)

---

## Development Tasks

### 1. Project Setup & Structure
- Clean up existing Chinese learning game files
- Initialize fresh betting platform structure
- Install required dependencies (@tanstack/react-query for data fetching)
- Set up routing for betting pages

### 2. Generate Images
- Create all 6 sports images using ImageCreator.generate_image
- Store in public/assets/sports/ directory

### 3. Core Pages
- **HomePage** - Hero with live games, featured bets, quick stats
- **SportsPage** - Browse all sports categories (NFL, NBA, MLB, Soccer, etc.)
- **LiveBettingPage** - Real-time odds updates, live games
- **MyBetsPage** - Betting history, active bets, statistics
- **WalletPage** - Virtual currency balance, transaction history

### 4. Key Components
- **BetSlip** - Floating bet slip to place bets
- **GameCard** - Display game info, teams, odds
- **OddsDisplay** - Show betting odds with color coding
- **LiveIndicator** - Pulsing indicator for live games
- **WalletBalance** - Display virtual currency
- **BetHistoryTable** - Show past bets with results

### 5. Sports API Integration
- Integrate sports data API (The Odds API or similar)
- Fetch live games and odds
- Update odds in real-time
- Handle API rate limits

### 6. Betting Logic
- Virtual wallet system (localStorage for MVP)
- Place bet functionality
- Calculate potential winnings
- Bet validation (sufficient balance, valid odds)
- Settle bets based on game results

### 7. State Management
- Set up React Query for API data
- Create betting context for bet slip
- Wallet context for balance management
- Persist data in localStorage

### 8. Styling & Animations
- Apply dark theme design system
- Add smooth transitions for odds changes
- Pulsing animations for live games
- Responsive design for all screen sizes

### 9. Testing & Optimization
- Test betting flow end-to-end
- Verify odds display accuracy
- Check responsive layouts
- Performance optimization

### 10. Final Polish
- Add loading states
- Error handling for API failures
- Success/error notifications
- Lint and build check