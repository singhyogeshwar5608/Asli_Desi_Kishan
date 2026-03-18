import { startOfDay, subDays } from 'date-fns';
import { MemberModel } from '@modules/members/member.model';
import { OrderModel } from '@modules/orders/order.model';
import type { ExportReportQuery, RangeQueryDto } from './report.validation';

const toNumber = (value: unknown) => (typeof value === 'number' ? value : 0);

const buildOrderExportProjection = () => ({
  _id: 0,
  orderId: '$memberSnapshot.memberId',
  memberName: '$memberSnapshot.fullName',
  subtotal: '$subtotal',
  discount: '$discount',
  total: '$total',
  totalBv: '$totalBv',
  status: '$status',
  createdAt: '$createdAt',
});

const buildMemberExportProjection = () => ({
  _id: 0,
  memberId: '$memberId',
  fullName: '$fullName',
  email: '$email',
  status: '$status',
  totalBv: '$bv.total',
  leftLegBv: '$bv.leftLeg',
  rightLegBv: '$bv.rightLeg',
  teamSize: '$stats.teamSize',
  createdAt: '$createdAt',
});

export const ReportService = {
  getDashboardMetrics: async (query: RangeQueryDto) => {
    const range = query.range ?? 30;
    const rangeStart = startOfDay(subDays(new Date(), range));
    const todayStart = startOfDay(new Date());

    const [totals, ordersAgg, todaysOrders, salesSeries] = await Promise.all([
      Promise.all([
        MemberModel.countDocuments(),
        MemberModel.countDocuments({ status: 'ACTIVE' }),
        OrderModel.countDocuments(),
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
            totalBv: { $sum: '$totalBv' },
            ordersCount: { $sum: 1 },
          },
        },
      ]),
      OrderModel.countDocuments({ createdAt: { $gte: todayStart } }),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            sales: { $sum: '$total' },
            bv: { $sum: '$totalBv' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const [totalMembers, activeMembers, totalOrders] = totals;
    const orderStats = ordersAgg[0] ?? { totalSales: 0, totalBv: 0, ordersCount: 0 };

    const topMembers = await MemberModel.find()
      .sort({ 'bv.total': -1 })
      .limit(5)
      .select('memberId fullName email bv stats teamSize')
      .lean();

    const series = salesSeries.map((entry) => ({
      label: entry._id,
      sales: toNumber(entry.sales),
      bv: toNumber(entry.bv),
    }));

    return {
      totals: {
        totalMembers,
        activeMembers,
        totalOrders,
        todaysOrders,
        totalSales: toNumber(orderStats.totalSales),
        totalBv: toNumber(orderStats.totalBv),
      },
      topMembers,
      salesSeries: series,
    };
  },

  exportReport: async (query: ExportReportQuery) => {
    const limit = query.limit ?? 1000;
    if (query.type === 'orders') {
      const orders = await OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(buildOrderExportProjection())
        .lean();
      return { type: 'orders', records: orders };
    }

    const members = await MemberModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(buildMemberExportProjection())
      .lean();
    return { type: 'members', records: members };
  },
};
