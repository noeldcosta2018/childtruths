# ChildTruths

**The hard talks, made simple.** AI-powered layered explanations for parents.

## Quick Start

```bash
cd childtruths
npm install
cp .env.example .env.local   # Add your API keys (optional — works in demo mode without them)
npm run dev
```

Open http://localhost:3000

## What's Included

- **15 screens**: Splash → Onboarding → Auth (login/signup/forgot/Google) → Setup (language/country/beliefs) → Add Child → Home → Loading → Result (layered) → Paywall → Saved → Settings → Legal pages (Privacy/Terms/Refund)
- **Claude API integration**: Real AI-generated layered explanations with fallback demo mode
- **Stripe integration**: Monthly ($6.99) / Annual ($49.99) with checkout sessions
- **3 free tries/month**: Usage tracking with monthly reset
- **Dark/Light mode**: TAMM-inspired premium dark theme
- **Lucide icons**: Professional icon set throughout
- **Error handling**: Form validation, API errors, graceful fallbacks
- **Legal pages**: Privacy Policy (COPPA), Terms of Service, Refund Policy

## Deploy to Vercel

```bash
npm i -g vercel && vercel
```

Add env vars in Vercel dashboard.
