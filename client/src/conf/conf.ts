const config = {
  backenedURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
};
export default config;
