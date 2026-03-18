import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useOrders, useRefundOrder, useUpdateOrderStatus } from '../../features/orders/api';
import type { OrderStatus, PaymentStatus, OrderSummary } from '../../features/orders/types';

const orderStatuses: Array<OrderStatus | 'ALL'> = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const paymentStatuses: Array<PaymentStatus | 'ALL'> = ['ALL', 'PENDING', 'PAID', 'REFUNDED', 'FAILED'];

const statusBadges: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-600 dark:bg-amber-300/10 dark:text-amber-300',
  PROCESSING: 'bg-sky-100 text-sky-600 dark:bg-sky-300/10 dark:text-sky-300',
  SHIPPED: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-300/10 dark:text-indigo-300',
  DELIVERED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-300/10 dark:text-emerald-300',
  CANCELLED: 'bg-rose-100 text-rose-600 dark:bg-rose-300/10 dark:text-rose-300',
};

const OrdersPage = () => {
  const [filters, setFilters] = useState({ status: 'ALL' as OrderStatus | 'ALL', paymentStatus: 'ALL' as PaymentStatus | 'ALL', memberSearch: '' });
  const { data, isLoading, isError, refetch } = useOrders(filters);
  const updateStatus = useUpdateOrderStatus();
  const refundOrder = useRefundOrder();

  const handleFilterChange = (key: 'status' | 'paymentStatus' | 'memberSearch', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const visibleOrders = useMemo(() => data?.data ?? [], [data]);

  const handleStatusChange = async (order: OrderSummary, next: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: next });
      toast.success(`Order ${order.id.slice(-6)} updated to ${next}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleRefund = async (order: OrderSummary) => {
    try {
      await refundOrder.mutateAsync({ id: order.id });
      toast.success(`Order ${order.id.slice(-6)} refunded`);
    } catch (error) {
      toast.error('Refund failed');
    }
  };

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-rose-200 dark:border-rose-400/30 p-6">
        <p className="text-rose-500 font-semibold mb-4">Unable to load orders.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Logistics</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor fulfilment, payments, and refunds in real time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search member"
            value={filters.memberSearch}
            onChange={(e) => handleFilterChange('memberSearch', e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none col-span-1 md:col-span-2"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-white/5 shadow-card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
          <thead className="bg-slate-50 dark:bg-white/5">
            <tr>
              {['Order', 'Member', 'Totals', 'Status', 'Payment', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="px-6 py-6">
                      <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : visibleOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-white">#{order.id.slice(-8)}</p>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{order.memberSnapshot.fullName}</p>
                      <p className="text-xs text-slate-400">{order.memberSnapshot.memberId}</p>
                      <p className="text-xs text-slate-400">{order.memberSnapshot.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        ${order.total.toLocaleString()} · BV {order.totalBv}
                      </p>
                      {order.couponCode && (
                        <p className="text-xs text-primary">Coupon: {order.couponCode}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadges[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.paymentStatus}</p>
                      <p className="text-xs text-slate-400">{order.paymentMethod}</p>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        disabled={updateStatus.isPending}
                        className="text-xs rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1"
                      >
                        {orderStatuses
                          .filter((status) => status !== 'ALL')
                          .map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                      </select>
                      {order.paymentStatus === 'PAID' && order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleRefund(order)}
                          disabled={refundOrder.isPending}
                          className="text-xs font-semibold text-rose-500 disabled:opacity-50"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            {!isLoading && visibleOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {data && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing {data.data.length} of {data.meta.total} orders
            </span>
            <button className="text-primary font-semibold text-xs uppercase tracking-wide">View all</button>
          </div>
        )}
      </div>
    </div>
  );
};

export { OrdersPage };
