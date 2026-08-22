/** Payment gateway abstraction — Razorpay is the current provider.
 *  All gateway-specific logic is isolated to RazorpayGateway.ts.
 *  Swap by implementing a new class and changing the factory. */

export interface GatewayOrder {
  orderId: string       // gateway order ID
  amount: number        // in paise
  currency: string
  receipt: string       // our idempotency_key
}

export interface GatewayCapture {
  paymentId: string
  orderId: string
  signature: string     // HMAC for server-side verification
  amount: number
}

export interface GatewayRefund {
  refundId: string
  paymentId: string
  amount: number
  status: string
}

export interface PaymentGateway {
  /** Create a payment order on the gateway (called server-side) */
  createOrder(
    amountPaise: number,
    currency: string,
    receipt: string,       // our idempotency_key — used as Razorpay receipt
    notes?: Record<string, string>
  ): Promise<GatewayOrder>

  /** Verify HMAC signature from client-side success callback.
   *  NEVER activate membership based on client data alone — this is step 1. */
  verifyPaymentSignature(capture: GatewayCapture): boolean

  /** Verify webhook event signature (from Razorpay webhook header) */
  verifyWebhookSignature(body: string, signature: string): boolean

  /** Initiate refund */
  refund(paymentId: string, amountPaise: number): Promise<GatewayRefund>
}
