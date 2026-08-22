import 'server-only'
import { RazorpayGateway } from './RazorpayGateway'
import type { PaymentGateway } from './types'

let _gateway: PaymentGateway | null = null

export function getPaymentGateway(): PaymentGateway {
  if (!_gateway) _gateway = new RazorpayGateway()
  return _gateway
}
