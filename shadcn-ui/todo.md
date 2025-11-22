# Authentication & Payment Web Application - MVP Todo List

## Overview
Build a web application with user authentication (email/password + social login UI) and Stripe payment integration ($1 payment feature).

## Core Files to Create (Maximum 8 files)

1. **src/pages/Index.tsx** - Landing page with hero section, features, and $1 payment CTA
2. **src/pages/Login.tsx** - Login page with email/password and social login buttons
3. **src/pages/Signup.tsx** - Registration page with form validation
4. **src/pages/Dashboard.tsx** - Protected user dashboard after login
5. **src/pages/Payment.tsx** - Stripe payment checkout page
6. **src/contexts/AuthContext.tsx** - Authentication context for managing user state
7. **src/lib/stripe.ts** - Stripe configuration and helper functions
8. **src/App.tsx** - Update routing and add protected routes

## Implementation Details

### Authentication Flow
- Use localStorage to store user session (email, name, login status)
- Social login buttons (Google, Facebook, Twitter) - UI only, ready for OAuth integration
- Protected routes that redirect to login if not authenticated
- Logout functionality

### Payment Integration
- Stripe Elements for card input
- $1 fixed payment amount
- Payment confirmation page
- Mock Stripe key (user can replace with their own)

### Design
- Modern, professional landing page with gradient backgrounds
- Clean authentication forms with validation
- Responsive design for mobile and desktop
- Use shadcn-ui components throughout

## Tech Stack
- React + TypeScript
- shadcn-ui components
- Tailwind CSS
- React Router for navigation
- Stripe.js for payments
- localStorage for demo authentication