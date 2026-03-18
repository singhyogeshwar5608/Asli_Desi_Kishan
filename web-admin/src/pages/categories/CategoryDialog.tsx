import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { CategorySummary } from '../../features/categories/types';
import { useCreateCategory, useUpdateCategory } from '../../features/categories/api';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: CategorySummary | null;
}

const initialForm = { name: '', slug: '', is_active: true };

const CategoryDialog = ({ open, onClose, category }: CategoryDialogProps) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditMode = Boolean(category?.id);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setErrors({});
      return;
    }

    if (category) {
      setForm({
        name: category.name,
        slug: category.slug ?? '',
        is_active: category.is_active,
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
  }, [open, category]);

  if (!open) return null;

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      is_active: form.is_active,
    };
    try {
      if (isEditMode && category) {
        await updateCategory.mutateAsync({ id: category.id, payload });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(payload);
        toast.success('Category created');
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to save category');
    }
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white dark:bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Catalog</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit category' : 'Add category'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
              placeholder="e.g. Wellness"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-200">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => handleChange('slug', event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:text-white"
              placeholder="auto-generated when empty"
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => handleChange('is_active', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Active category
          </label>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryDialog;
