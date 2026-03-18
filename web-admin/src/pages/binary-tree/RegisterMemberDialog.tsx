import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCreateMember, useUploadMemberProfile } from '../../features/members/api';
import type { MemberTreeNode } from '../../features/members/types';

interface RegisterMemberDialogProps {
  open: boolean;
  sponsor?: MemberTreeNode;
  leg?: 'LEFT' | 'RIGHT';
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  profileImage: string;
}

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  profileImage: '',
};

const RegisterMemberDialog = ({ open, sponsor, leg, onClose, onSuccess }: RegisterMemberDialogProps) => {
  const createMember = useCreateMember();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<keyof FormState, string>>({ fullName: '', email: '', phone: '', password: '' });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const uploadProfileMutation = useUploadMemberProfile();
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setErrors({ fullName: '', email: '', phone: '', password: '' });
      setPosition({ x: 0, y: 0 });
      dragStateRef.current.isDragging = false;
      setIsDragging(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;
      const dx = event.clientX - dragStateRef.current.startX;
      const dy = event.clientY - dragStateRef.current.startY;
      setPosition({
        x: dragStateRef.current.initialX + dx,
        y: dragStateRef.current.initialY + dy,
      });
    };

    const handleMouseUp = () => {
      if (!dragStateRef.current.isDragging) return;
      dragStateRef.current.isDragging = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [open]);

  const sponsorLabel = useMemo(() => {
    if (!sponsor) return 'Not selected';
    return `${sponsor.fullName ?? sponsor.memberId} (${sponsor.memberId})`;
  }, [sponsor]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<keyof FormState, string> = { fullName: '', email: '', phone: '', password: '' };
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sponsor?.memberId || !leg) {
      toast.error('Select a valid sponsor slot.');
      return;
    }
    if (!validate()) return;

    try {
      await createMember.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        sponsorId: sponsor.memberId,
        leg,
        profileImage: form.profileImage.trim() || undefined,
      });
      toast.success('Member registered successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to register member');
    }
  };

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    setIsDragging(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div
        className="w-full max-w-xl rounded-[32px] border border-slate-100 bg-white shadow-2xl dark:border-white/5 dark:bg-slate-950"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div
          className={`flex cursor-${isDragging ? 'grabbing' : 'grab'} items-center justify-between rounded-t-[32px] border-b border-slate-100 px-8 py-5 dark:border-white/5`}
          onMouseDown={handleDragStart}
        >
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Binary Tree</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Register member</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600 dark:hover:text-white"
            aria-label="Close register dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div className="rounded-2xl border border-slate-100 px-4 py-3 text-sm dark:border-white/10">
            <p className="text-xs uppercase text-slate-400">Sponsor</p>
            <p className="font-semibold text-slate-900 dark:text-white">{sponsorLabel}</p>
            <p className="text-xs uppercase text-slate-400 mt-3">Leg</p>
            <p className="font-semibold text-slate-900 dark:text-white">{leg ?? '—'}</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Profile image</p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                    {form.profileImage ? (
                      <img src={form.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/10 dark:text-white"
                      onClick={() => profileInputRef.current?.click()}
                      disabled={uploadProfileMutation.isPending}
                    >
                      {uploadProfileMutation.isPending ? 'Uploading…' : 'Upload image'}
                    </button>
                    {form.profileImage && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-500"
                        onClick={() => handleChange('profileImage', '')}
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Image URL</label>
                  <input
                    type="url"
                    value={form.profileImage}
                    onChange={(event) => handleChange('profileImage', event.target.value)}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const uploaded = await uploadProfileMutation.mutateAsync(file);
                    handleChange('profileImage', uploaded.url);
                    toast.success('Profile image uploaded');
                  } catch (error: any) {
                    toast.error(error?.response?.data?.message ?? 'Upload failed');
                  } finally {
                    event.target.value = '';
                  }
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => handleChange('fullName', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
              />
              {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
                />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              disabled={createMember.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card disabled:opacity-70"
              disabled={createMember.isPending}
            >
              {createMember.isPending ? 'Registering…' : 'Register member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMemberDialog;
