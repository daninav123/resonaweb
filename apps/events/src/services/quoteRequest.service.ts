import { api } from '@resona/api-client';

export interface SubmitBriefInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  attendees: number;
  eventDate?: string;
  eventLocation?: string;
  services: string[];
  estimatedTotal?: number;
  notes?: string;
}

export interface SubmitBriefResponse {
  success: boolean;
  message?: string;
  data?: { id: string };
}

export interface ReserveWithPaymentInput extends SubmitBriefInput {
  selectedPack: string;
  successUrl: string;
  cancelUrl: string;
}

export interface ReserveWithPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    quoteRequestId: string;
    checkoutUrl: string;
    firstPayment: number;
    total: number;
  };
}

export const quoteRequestService = {
  async submit(input: SubmitBriefInput): Promise<SubmitBriefResponse> {
    return api.post<SubmitBriefResponse>('/quote-requests/public', {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      eventType: input.eventType,
      attendees: input.attendees,
      duration: 1,
      durationType: 'DAY',
      eventDate: input.eventDate || null,
      eventLocation: input.eventLocation || null,
      selectedExtras: { services: input.services },
      estimatedTotal: input.estimatedTotal ?? null,
      notes: input.notes || null,
    });
  },

  async reserveWithPayment(input: ReserveWithPaymentInput): Promise<ReserveWithPaymentResponse> {
    return api.post<ReserveWithPaymentResponse>('/quote-requests/public/with-payment', {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      eventType: input.eventType,
      attendees: input.attendees,
      duration: 1,
      durationType: 'DAY',
      eventDate: input.eventDate || null,
      eventLocation: input.eventLocation || null,
      selectedPack: input.selectedPack,
      selectedExtras: { services: input.services },
      estimatedTotal: input.estimatedTotal,
      notes: input.notes || null,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  },
};
