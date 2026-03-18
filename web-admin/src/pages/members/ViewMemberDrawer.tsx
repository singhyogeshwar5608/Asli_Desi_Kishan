import { useMemberDetail } from '../../features/members/api';

interface Props {
  memberId?: string;
  open: boolean;
  onClose: () => void;
}

const ViewMemberDrawer = ({ memberId, open, onClose }: Props) => {
  const { data, isLoading } = useMemberDetail(memberId, open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/5 max-h-[82vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Member</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Overview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-6 overflow-y-auto scrollbar-hidden">
          {isLoading || !data ? (
            <div className="space-y-4">
              <div className="h-4 w-3/4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-32 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-slate-400">Full name</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.fullName}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-300">
                <div>
                  <p className="text-xs uppercase text-slate-400">Member ID</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{data.memberId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Email</p>
                  <p>{data.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Phone</p>
                  <p>{data.phone ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Status</p>
                  <p className="font-semibold">{data.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-xs uppercase text-slate-400">Team size</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{data.stats?.teamSize ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-xs uppercase text-slate-400">Direct refs</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{data.stats?.directRefs ?? 0}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-4">
                <p className="text-xs uppercase text-slate-400">Wallet</p>
                <div className="flex items-center justify-between mt-2 text-sm text-slate-500 dark:text-slate-300">
                  <span>Balance</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${data.wallet?.balance?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
                  <span>Total earned</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${data.wallet?.totalEarned?.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { ViewMemberDrawer };
