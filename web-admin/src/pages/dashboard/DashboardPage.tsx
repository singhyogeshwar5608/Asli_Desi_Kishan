import { useState } from 'react';
import { Activity, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardMetrics } from '../../features/dashboard/api';
import { KpiCard } from '../../components/cards/KpiCard';

const DashboardPage = () => {
  const { data, isLoading } = useDashboardMetrics();
  const [simConfig, setSimConfig] = useState({
    joiningAmount: '10000',
    businessVolume: '5000',
    selfIncome: '10',
    directIncome: '20',
    matchingIncome: '10',
    awardIncome: '6',
    repurchaseAmount: '10000',
    repurchaseBv: '2000',
    weeklyCapping: '50000',
  });
  const [repurchaseUserId, setRepurchaseUserId] = useState('');

  if (isLoading || !data) {
    return <div className="text-slate-500">Loading dashboard...</div>;
  }

  const { totals, topMembers } = data;

  const kpis = [
    {
      title: 'Total Members',
      value: totals.totalMembers.toLocaleString(),
      subtitle: `${totals.activeMembers} active`,
      icon: <Users />,
    },
    {
      title: 'Total Sales',
      value: `$${totals.totalSales.toLocaleString()}`,
      subtitle: 'Revenue last 30 days',
      icon: <TrendingUp />,
    },
    {
      title: 'Total BV',
      value: totals.totalBv.toLocaleString(),
      subtitle: '30-day volume',
      icon: <Activity />,
    },
    {
      title: 'Orders Today',
      value: totals.todaysOrders.toString(),
      subtitle: `${totals.totalOrders} lifetime`,
      icon: <ShoppingBag />,
    },
  ];

  const simulationFields: Array<{
    label: string;
    field: keyof typeof simConfig;
    placeholder: string;
  }> = [
    { label: 'Joining Amount (₹)', field: 'joiningAmount', placeholder: '10000' },
    { label: 'Business Volume (BV)', field: 'businessVolume', placeholder: '5000' },
    { label: 'Self Income %', field: 'selfIncome', placeholder: '10' },
    { label: 'Direct Income %', field: 'directIncome', placeholder: '20' },
    { label: 'Matching Income %', field: 'matchingIncome', placeholder: '10' },
    { label: 'Award Income %', field: 'awardIncome', placeholder: '6' },
    { label: 'Repurchase Amount (₹)', field: 'repurchaseAmount', placeholder: '10000' },
    { label: 'Repurchase BV', field: 'repurchaseBv', placeholder: '2000' },
    { label: 'Weekly Capping (₹)', field: 'weeklyCapping', placeholder: '50000' },
  ];

  const updateSimulationSettings = () => {
    toast.success('Simulation settings updated');
  };

  const handleCycleAction = (action: 'repurchase' | 'previous' | 'next' | 'process' | 'reset') => {
    const labels: Record<typeof action, string> = {
      repurchase: 'Repurchase processed',
      previous: 'Moved to previous cycle',
      next: 'Moved to next cycle',
      process: 'Current cycle processed',
      reset: 'Demo data reset',
    };
    toast.info(labels[action]);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-slate-100 bg-slate-900 text-white shadow-card dark:border-white/10">
          <div className="border-b border-white/10 px-6 py-4">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Strategy Lab</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-semibold">Simulation Controls</h3>
              <p className="text-sm text-slate-300">Adjust all business plan parameters dynamically.</p>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulationFields.map((field) => (
                <label key={field.field} className="text-sm font-semibold text-slate-200">
                  {field.label}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={simConfig[field.field]}
                    onChange={(event) =>
                      setSimConfig((prev) => ({
                        ...prev,
                        [field.field]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={updateSimulationSettings}
                className="rounded-2xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-400"
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white shadow-card dark:border-white/10 dark:bg-slate-950">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-white/5">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">Operations</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cycle & Transaction Controls</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Process repurchases and manage cycle progression.</p>
          </div>
          <div className="space-y-4 px-6 py-6">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">
              User ID
              <input
                type="text"
                value={repurchaseUserId}
                onChange={(event) => setRepurchaseUserId(event.target.value)}
                placeholder="MBR-001"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
            </label>
            <button
              type="button"
              onClick={() => handleCycleAction('repurchase')}
              className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card"
            >
              Repurchase
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCycleAction('previous')}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                ← Previous Cycle
              </button>
              <button
                type="button"
                onClick={() => handleCycleAction('next')}
                className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-emerald-400"
              >
                Next Cycle →
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleCycleAction('process')}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-indigo-500"
            >
              Process Current Cycle
            </button>
            <button
              type="button"
              onClick={() => handleCycleAction('reset')}
              className="w-full rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:border-rose-400/50 dark:text-rose-300 dark:hover:bg-rose-400/10"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-card border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Revenue Analytics
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                30-day sales vs BV trend
              </p>
            </div>
            <button className="text-sm font-medium text-primary">Download CSV</button>
          </div>
          <div className="h-72 flex items-center justify-center text-slate-400">
            {/* TODO: Replace placeholder with actual Recharts component */}
            Chart coming soon
          </div>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-card border border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Top Performers
          </h3>
          <div className="space-y-4">
            {topMembers.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{member.fullName}</p>
                  <p className="text-xs text-slate-400">{member.memberId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    BV {member.bv?.total?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-slate-400">Team: {member.stats?.teamSize ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardPage };
