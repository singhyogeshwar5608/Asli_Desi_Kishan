export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface OrderSummary {
  id: string;
  memberSnapshot: {
    memberId: string;
    fullName: string;
    email: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  totalBv: number;
  couponCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  history: Array<{
    status: OrderStatus;
    note?: string;
    changedBy: string;
    changedAt: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
