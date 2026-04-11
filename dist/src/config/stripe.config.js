import Stripe from "stripe";
import env from "src/config/env";
export const stripe = new Stripe(env.STRIPE.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
});
