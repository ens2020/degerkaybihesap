import { logger } from '../common/logger.js';

type ChargeInput = {
  amount: number;
  currency: string;
  source: string;
  metadata?: Record<string, string>;
};

type ChargeResult = {
  id: string;
  status: 'succeeded' | 'failed';
};

type SubscriptionInput = {
  customerEmail: string;
  planId: string;
};

type SubscriptionResult = {
  id: string;
  status: 'active' | 'incomplete';
};

class PaymentProvider {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    logger.info('payment.charge.request', input);
    if (input.amount <= 0) {
      logger.error('payment.charge.invalid', { amount: input.amount });
      return { id: 'invalid', status: 'failed' };
    }
    const id = `pay_${Date.now()}`;
    logger.info('payment.charge.success', { id });
    return { id, status: 'succeeded' };
  }

  async createSubscription(input: SubscriptionInput): Promise<SubscriptionResult> {
    logger.info('payment.subscription.request', input);
    const id = `sub_${Date.now()}`;
    return { id, status: 'active' };
  }
}

export const paymentProvider = new PaymentProvider();
export type { ChargeInput, ChargeResult, SubscriptionInput, SubscriptionResult };
