import { api } from './api';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

class PaymentService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }

  /**
   * Get Stripe instance
   */
  async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(orderId: string, amount: number) {
    return api.post('/payment/create-intent', { orderId, amount });
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId: string) {
    return api.post('/payment/confirm', { paymentIntentId });
  }

  /**
   * Request refund
   */
  async requestRefund(paymentId: string, amount?: number, reason?: string) {
    return api.post('/payment/refund', { paymentId, amount, reason });
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(page: number = 1, limit: number = 10) {
    return api.get(`/payment/history?page=${page}&limit=${limit}`);
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    return api.get('/payment/methods');
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    return api.get(`/payment/${paymentId}/status`);
  }

  /**
   * Process payment with Stripe Elements
   */
  async processPayment(
    stripe: Stripe,
    elements: StripeElements,
    clientSecret: string
  ) {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentIntent;
  }
}

export const paymentService = new PaymentService();
