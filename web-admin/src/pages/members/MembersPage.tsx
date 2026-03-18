import { useMemo, useState } from 'react';
import { useDeleteMember, useMembers, useUpdateMember } from '../../features/members/api';
import type { MemberSummary } from '../../features/members/types';
import { CreateMemberDialog } from './CreateMemberDialog';
import { EditMemberDialog } from './EditMemberDialog';
import { ViewMemberDrawer } from './ViewMemberDrawer';
import { toast } from 'sonner';

const statusColors: Record<MemberSummary['status'], string> = {
  ACTIVE: 'text-emerald-600 bg-emerald-100/70 dark:text-emerald-300 dark:bg-emerald-300/10',
  SUSPENDED: 'text-rose-600 bg-rose-100/70 dark:text-rose-300 dark:bg-rose-300/10',
  PENDING: 'text-amber-600 bg-amber-100/70 dark:text-amber-300 dark:bg-amber-300/10',
};

const MembersPage = () => {
  const { data, isLoading, isError, refetch } = useMembers();
  const deleteMutation = useDeleteMember();
  const updateStatusMutation = useUpdateMember();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | undefined>();
  const [viewMemberId, setViewMemberId] = useState<string | undefined>();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    if (!data) return [];
    if (!search) return data.data;
    const term = search.toLowerCase();
    return data.data.filter(
      (member) =>
        member.fullName.toLowerCase().includes(term) ||
        member.memberId.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleDelete = async (member: MemberSummary) => {
    const identifier = member.id ?? member.memberId;
    if (!identifier) {
      toast.error('Member identifier missing');
      return;
    }
    const confirmed = window.confirm(`Delete ${member.fullName}? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(identifier);
      toast.success('Member deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to delete member');
    }
  };

  const handleToggleStatus = async (member: MemberSummary) => {
    const identifier = member.id ?? member.memberId;
    if (!identifier) {
      toast.error('Member identifier missing');
      return;
    }

    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateStatusMutation.mutateAsync({ id: identifier, status: nextStatus });
      toast.success(`Member ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to update member status');
    } finally {
      setMenuOpenId(null);
    }
  };

  const toggleMenuForMember = (member: MemberSummary) => {
    const identifier = member.id ?? member.memberId;
    if (!identifier) return;
    setMenuOpenId((prev) => (prev === identifier ? null : identifier));
  };

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-rose-200 dark:border-rose-400/30 p-6">
        <p className="text-rose-500 font-semibold mb-4">Unable to load members.</p>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Network</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Members</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track performance and status of every node.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search by name, ID, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button
            className="rounded-2xl bg-primary text-white text-sm font-semibold px-5 py-2.5 shadow-card"
            onClick={() => setDialogOpen(true)}
          >
            New member
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-white/5 shadow-card">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
          <thead className="bg-slate-50 dark:bg-white/5">
            <tr>
              {[
                'Member',
                'Member-ID',
                'Left Team',
                'Left BV',
                'Right Team',
                'Right BV',
                'Left Child',
                'Right Child',
                'BV',
                'Team',
                'Status',
                'Joined',
                'Action',
              ].map((heading) => (
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
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={13} className="px-6 py-6">
                      <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : filteredMembers.map((member) => {
                  const identifier = member.id ?? member.memberId;
                  if (!identifier) {
                    return null;
                  }
                  const isMenuOpen = menuOpenId === identifier;
                  const toggleLabel = member.status === 'ACTIVE' ? 'Deactivate' : 'Activate';
                  const leftTeam = member.stats?.leftTeam ?? 0;
                  const rightTeam = member.stats?.rightTeam ?? 0;
                  const leftBv = member.stats?.leftBv ?? member.bv?.leftLeg ?? 0;
                  const rightBv = member.stats?.rightBv ?? member.bv?.rightLeg ?? 0;
                  const leftChild = member.stats?.leftChild ?? '—';
                  const rightChild = member.stats?.rightChild ?? '—';
                  return (
                    <tr key={identifier} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="uppercase text-slate-900 dark:text-white">{member.fullName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white uppercase">{member.memberId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{leftTeam}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{leftBv.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{rightTeam}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{rightBv.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{leftChild || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{rightChild || '—'}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {member.bv?.total?.toLocaleString() ?? 0}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                        {member.stats?.teamSize ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[member.status]}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <button
                            type="button"
                            aria-label={`Delete ${member.fullName}`}
                            className="p-2 rounded-full hover:text-rose-500 hover:bg-rose-500/10"
                            onClick={() => handleDelete(member)}
                            disabled={deleteMutation.isPending}
                          >
                            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                              <path
                                d="M6 7.5v6M10 7.5v6M14 7.5v6"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M4 5.5h12M7.5 5.5V4h5v1.5M6 5.5V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <div className="relative">
                            <button
                              type="button"
                              aria-haspopup="menu"
                              aria-expanded={isMenuOpen}
                              aria-label={`More actions for ${member.fullName}`}
                              className="p-2 rounded-full hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10"
                              onClick={() => {
                                if (!identifier) return;
                                toggleMenuForMember(member);
                              }}
                            >
                              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                                <path
                                  d="M10 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 10 4Zm0 4.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm0 4.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                            {isMenuOpen && (
                              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl z-10 py-2">
                                <button
                                  type="button"
                                  className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                                  onClick={() => {
                                    setViewMemberId(identifier);
                                    setMenuOpenId(null);
                                  }}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                                  onClick={() => {
                                    setEditMemberId(identifier);
                                    setMenuOpenId(null);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                                  onClick={() => handleToggleStatus(member)}
                                >
                                  {toggleLabel}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            {!isLoading && filteredMembers.length === 0 && (
              <tr>
                <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
                  No members match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {data && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing {data.data.length} of {data.meta.total} members
            </span>
            <button className="text-primary font-semibold text-xs uppercase tracking-wide">View all</button>
          </div>
        )}
      </div>
      <CreateMemberDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} />
      <EditMemberDialog
        open={Boolean(editMemberId)}
        memberId={editMemberId}
        onClose={() => setEditMemberId(undefined)}
      />
      <ViewMemberDrawer
        open={Boolean(viewMemberId)}
        memberId={viewMemberId}
        onClose={() => setViewMemberId(undefined)}
      />
    </div>
  );
};

export { MembersPage };
