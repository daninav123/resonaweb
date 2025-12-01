import { api } from './api';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

class PaymentService {
  private stripePromise: Promise<Stripe | null> | null = null;
  private publishableKey: string | null = null;

  /**
   * Initialize Stripe with config from backend
   */
  async initialize() {
    if (!this.stripePromise) {
      try {
        const config: any = await api.get('/payments/config');
        this.publishableKey = config.publishableKey;
        
        if (this.publishableKey) {
          this.stripePromise = loadStripe(this.publishableKey);
        } else {
          console.warn('Stripe publishable key not configured');
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      }
    }
    return this.stripePromise;
  }

  /**
   * Get Stripe instance
   */
  async getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      await this.initialize();
    }
    return this.stripePromise || null;
  }

  /**
   * Create payment intent for order
   */
  async createPaymentIntent(orderId: string) {
    return api.post('/payments/create-intent', { orderId });
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId: string) {
    return api.post('/payments/confirm', { paymentIntentId });
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string) {
    return api.post('/payments/cancel', { paymentIntentId });
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentIntentId: string) {
    return api.get(`/payments/details/${paymentIntentId}`);
  }

  /**
   * Request refund (admin only)
   */
  async requestRefund(orderId: string, amount?: number, reason?: string) {
    return api.post('/payments/refund', { orderId, amount, reason });
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
