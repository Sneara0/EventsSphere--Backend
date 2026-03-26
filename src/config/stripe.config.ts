import Stripe from "stripe";
import env from "src/config/env";

export const stripe = new Stripe(env.STRIPE.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27" as any, 
  typescript: true, 
});