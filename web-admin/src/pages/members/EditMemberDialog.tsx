import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMemberDetail, useUpdateMember, useUploadMemberProfile } from '../../features/members/api';

interface Props {
  memberId?: string;
  open: boolean;
  onClose: () => void;
}

const EditMemberDialog = ({ memberId, open, onClose }: Props) => {
  const { data, isLoading } = useMemberDetail(memberId, open);
  const mutation = useUpdateMember();
  const uploadProfileMutation = useUploadMemberProfile();
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leg, setLeg] = useState<'LEFT' | 'RIGHT' | undefined>();
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    if (data && open) {
      setFullName(data.fullName ?? '');
      setEmail(data.email ?? '');
      setPhone(data.phone ?? '');
      setLeg(data.leg);
      setStatus(data.status);
      setProfileImage(data.profileImage ?? '');
    }
  }, [data, open]);

  useEffect(() => {
    if (!open) {
      setFullName('');
      setEmail('');
      setPhone('');
      setLeg(undefined);
      setStatus('ACTIVE');
      setProfileImage('');
      mutation.reset();
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberId) return;
    try {
      await mutation.mutateAsync({
        id: memberId,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status,
        leg: leg ?? undefined,
        profileImage: profileImage.trim() || undefined,
      });
      toast.success('Member updated');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to update member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Network</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit member</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/5">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="bg-slate-50/60 dark:bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-40">
                      Full name
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50/60 dark:bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Email
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50/60 dark:bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Phone
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50/60 dark:bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Leg
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={leg ?? ''}
                        onChange={(e) => setLeg((e.target.value as 'LEFT' | 'RIGHT') || undefined)}
                        className="w-full text-black rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="">Unassigned</option>
                        <option value="LEFT">Left</option>
                        <option value="RIGHT">Right</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50/60 dark:bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as typeof status)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-500 hover:text-slate-700"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || isLoading}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-card disabled:opacity-60"
            >
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { EditMemberDialog };
