import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCreateMember, useUploadMemberProfile } from '../../features/members/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const initialState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  sponsorId: '',
  leg: 'LEFT' as 'LEFT' | 'RIGHT',
  profileImage: '',
};

const CreateMemberDialog = ({ open, onClose }: Props) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const mutation = useCreateMember();
  const uploadProfileMutation = useUploadMemberProfile();
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setErrors({});
      mutation.reset();
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [open, mutation]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition((prev) => {
        const { startX, startY, initialX, initialY } = dragStartRef.current;
        const nextX = initialX + (event.clientX - startX);
        const nextY = initialY + (event.clientY - startY);
        return { x: nextX, y: nextY };
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (event: React.MouseEvent) => {
    if (event.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  if (!open) return null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (form.password.length < 8) nextErrors.password = 'Password must be 8+ characters';
    if (!form.sponsorId.trim()) nextErrors.sponsorId = 'Sponsor ID is required';
    if (!form.leg) nextErrors.leg = 'Leg is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      await mutation.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        sponsorId: form.sponsorId.trim(),
        leg: form.leg,
        profileImage: form.profileImage.trim() || undefined,
      });
      toast.success(`${form.fullName} added successfully`);
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Failed to create member';
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div
        className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 w-full max-w-xl select-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div
          className={`flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 ${
            isDragging ? 'cursor-grabbing' : 'cursor-move'
          }`}
          onMouseDown={handleDragStart}
        >
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Network</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create member</h2>
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
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Profile image</p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/10 dark:text-white"
                    onClick={() => profileInputRef.current?.click()}
                    disabled={uploadProfileMutation.isPending}
                  >
                    {uploadProfileMutation.isPending ? 'Uploading…' : 'Upload image'}
                  </button>
                  {form.profileImage && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600"
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
                  onChange={(e) => handleChange('profileImage', e.target.value)}
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
                  toast.error(error?.response?.data?.message ?? 'Failed to upload image');
                } finally {
                  event.target.value = '';
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Sponsor member ID</label>
              <input
                type="text"
                value={form.sponsorId}
                onChange={(e) => handleChange('sponsorId', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. MBR-AB12"
              />
              <p className="mt-1 text-xs text-slate-400">Use memberId column from the table above.</p>
              {errors.sponsorId && <p className="mt-1 text-xs text-rose-500">{errors.sponsorId}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Leg</label>
              <select
                value={form.leg}
                onChange={(e) => handleChange('leg', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
              </select>
              {errors.leg && <p className="mt-1 text-xs text-rose-500">{errors.leg}</p>}
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-rose-500">
              {mutation.error instanceof Error ? mutation.error.message : 'Unable to create member'}
            </p>
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
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-card disabled:opacity-60"
            >
              {mutation.isPending ? 'Creating…' : 'Create member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { CreateMemberDialog };
