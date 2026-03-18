import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useCategories, useDeleteCategory, useUpdateCategory, type CategoryFilters } from '../../features/categories/api';
import type { CategorySummary } from '../../features/categories/types';
import CategoryDialog from './CategoryDialog';

type StatusFilter = NonNullable<CategoryFilters['status']> | 'ALL';

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const pageSizeOptions = [10, 20, 50];

const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });
const formatDate = (value?: string) => {
  if (!value) return '—';
  try {
    return dateFormatter.format(new Date(value));
  } catch (error) {
    return '—';
  }
};

const CategoryPage = () => {
  const [filters, setFilters] = useState<{ search: string; status: StatusFilter; page: number; limit: number }>(
    { search: '', status: 'ALL', page: 1, limit: 20 }
  );
  const deferredSearch = useDeferredValue(filters.search.trim());
  const queryFilters = useMemo<CategoryFilters>(
    () => ({
      search: deferredSearch || undefined,
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
    }),
    [deferredSearch, filters.limit, filters.page, filters.status]
  );

  const { data, isLoading, isError, refetch } = useCategories(queryFilters);
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const categories = data?.data ?? [];

  const openCreateDialog = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: CategorySummary) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (category: CategorySummary) => {
    const confirmed = window.confirm(`Delete "${category.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success(`${category.name} removed`);
    } catch (error) {
      toast.error('Unable to delete category');
    }
  };

  const handleToggleStatus = async (category: CategorySummary) => {
    try {
      await updateCategory.mutateAsync({ id: category.id, payload: { is_active: !category.is_active,
        slug: category.slug
       } });
      toast.success(`${category.name} ${category.is_active ? 'deactivated' : 'activated'}`);
      setMenuOpenId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to update category');
    }
  };

  const toggleMenuForCategory = (categoryId: string) => {
    setMenuOpenId((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Catalog</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">Organize how products are grouped inside NetShop.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
            <Search className="h-4 w-4" />
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))
              }
              placeholder="Search by name or slug"
              className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            />
          </label>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value as StatusFilter, page: 1 }))
            }
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-transparent dark:text-white"
          >
            {statusOptions.map((option) => (
              <option className="text-black" key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card"
          >
            <Plus className="h-4 w-4" />
            New category
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white shadow-card dark:border-white/5 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Overview</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {categories.length} visible • {data?.meta.total ?? 0} total entries
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        {isError ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-semibold text-rose-500">Unable to load categories.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-white/5">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-white/5">
                <tr>
                  {['Category', 'Slug', 'Created', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-6 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {isLoading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={5} className="px-6 py-5">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                      </td>
                    </tr>
                  ))}
                {!isLoading && categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                      No categories match your filters.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  categories.map((category) => (
                    <tr key={category.id} className={`${category.is_active===true?"":"" } hover:bg-slate-50/60 dark:hover:bg-white/5`}>
                      <td className="px-6 py-4">
                        <div className="uppercase text-slate-900 dark:text-white">{category.name}</div>

                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{category.slug}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{formatDate(category.created_at)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            category.is_active
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-300/10 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300'
                          }`}
                        >
                          {category.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(category)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => toggleMenuForCategory(category.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200"
                              aria-haspopup="menu"
                              aria-expanded={menuOpenId === category.id}
                              aria-label={`More actions for ${category.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {menuOpenId === category.id && (
                              <div className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-slate-100 bg-white p-1 text-sm shadow-2xl dark:border-white/10 dark:bg-slate-900">
                                <button
                                  type="button"
                                  className="w-full rounded-2xl px-4 py-2 text-left text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                                  onClick={() => {
                                    handleEdit(category);
                                    setMenuOpenId(null);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="w-full rounded-2xl px-4 py-2 text-left text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                                  onClick={() => handleToggleStatus(category)}
                                >
                                  {category.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.meta.pages > 1 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white px-6 py-4 shadow-card dark:border-white/5 dark:bg-slate-950 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-300">
            Showing {(data.meta.page - 1) * data.meta.limit + 1}-{Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{' '}
            {data.meta.total}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <span>Rows:</span>
              <select
                value={filters.limit}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, limit: Number(event.target.value), page: 1 }))
                }
                className="rounded-2xl border border-slate-200 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-transparent dark:text-white"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 p-1 text-slate-600 dark:border-white/10 dark:text-slate-200">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={data.meta.page === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-2xl disabled:opacity-40"
                aria-label="Previous page"
              >
                ‹
              </button>
              <span className="text-sm font-semibold">
                {data.meta.page} / {data.meta.pages}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(data.meta.pages, prev.page + 1) }))}
                disabled={data.meta.page === data.meta.pages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-2xl disabled:opacity-40"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      <CategoryDialog open={dialogOpen} onClose={closeDialog} category={editingCategory} />
    </div>
  );
};

export default CategoryPage;
