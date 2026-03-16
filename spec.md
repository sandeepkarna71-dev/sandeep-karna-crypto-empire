# Sandeep Karn Crypto Empire

## Current State
- Full-stack ICP app with Motoko backend + React frontend
- Pages: Home, Crypto, News, Trading, Vlog, Earn, Wallet, Login, Signup, Admin, Profile
- Auth system broken: uses ICP principal-based auth, anonymous users can't register
- Backend has: vlogs, announcements, ads, user accounts (principal-based), deposits, withdrawals, earn records
- Frontend has signup/login pages but they fail because actor uses anonymous principal
- Some duplicate nav items and sections exist
- No investment/trading plans, no referral system, no leaderboard, no trading signals

## Requested Changes (Diff)

### Add
- Fix registration/login: switch to username-based auth (no ICP principal needed, use username as key + password hash verification)
- Investment/Trading Plans page: Starter ($100 -> $5/day), Basic ($500 -> $30/day), Silver ($1000 -> $60/day), Gold ($5000 -> $300/day), Platinum ($10000 -> $700/day), Diamond ($50000 -> $4000/day) - all plans show 30% platform fee
- Referral system: each user gets unique referral code, earn bonus when referred user deposits
- Daily Login Bonus system
- Leaderboard page: top earners
- Trading Signals page: admin posts buy/sell signals
- News ticker on home
- Investment plan purchase/activation flow
- User dashboard with portfolio stats, active plans, earnings breakdown
- 30% platform commission automatically deducted from all earnings
- Investment requirement clearly shown for each plan
- Affiliate/referral tree
- Daily task checklist (login, watch video, deposit, refer friend)
- Trading journal

### Modify
- Backend: registerUser/loginUser now use username as primary key (Text), no principal requirement
- Backend: Add TradingPlan, UserPlan, ReferralRecord, TradingSignal, DailyBonus types
- Backend: All user operations use username-based lookup
- Home page: remove crypto charts/price tickers, keep ads/promos/vlogs/news preview
- Remove duplicate nav items
- Wallet: ETH/BTC/SOL/TRON addresses with copy buttons
- Admin dashboard: add tabs for Trading Plans, Signals, Users management

### Remove
- Principal-based auth requirement for registration
- Duplicate navigation items
- Crypto price charts from home page

## Implementation Plan
1. Rewrite backend with username-based user store, trading plans, signals, referral, daily bonus
2. Rebuild AuthContext to use username+password hash without principal requirement
3. Add InvestmentPlans page with 6 tiers showing investment/daily return/30% fee
4. Add TradingSignals page
5. Add Leaderboard page
6. Add Referral page with unique code
7. Fix Signup/Login pages with email field (display only, no OTP since disabled)
8. Clean up Home page - remove crypto charts, keep ads/vlogs/news/announcements
9. Remove duplicate nav items
10. Expand Admin dashboard with new management tabs
11. Update Wallet with all 4 crypto addresses + copy buttons
