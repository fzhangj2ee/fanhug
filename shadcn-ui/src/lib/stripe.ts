import { loadStripe, Stripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
// Get it from: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const PAYMENT_AMOUNT = 100; // $1.00 in cents