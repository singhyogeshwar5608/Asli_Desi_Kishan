import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useDeleteProduct, useProducts, useToggleProductStatus } from '../../features/products/api';
import type { ProductSummary } from '../../features/products/types';
import { ProductDialog } from './ProductDialog';
import { ProductDrawer } from './ProductDrawer';

const statusStyles: Record<'active' | 'inactive', string> = {
  active: 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-300/10',
  inactive: 'text-slate-500 bg-slate-100 dark:text-slate-300 dark:bg-white/5',
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) {
    return '—';
  }
  return currencyFormatter.format(value);
};

const ProductsPage = () => {
  const { data, isLoading, isError, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();
  const toggleStatus = useToggleProductStatus();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState<ProductSummary | null>(null);
  const [drawerProduct, setDrawerProduct] = useState<ProductSummary | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search) return data.data;
    const term = search.toLowerCase();
    return data.data.filter((product) =>
      [product.name, product.sku].some((field) => field.toLowerCase().includes(term))
    );
  }, [data, search]);

  const handleDelete = async (product: ProductSummary) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(`${product.name} removed`);
    } catch (error) {
      toast.error('Unable to delete product');
    }
  };

  const handleView = (product: ProductSummary) => {
    setDrawerProduct(product);
    setDrawerOpen(true);
  };

  const handleEdit = (product: ProductSummary) => {
    setDialogProduct(product);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (product: ProductSummary) => {
    try {
      await toggleStatus.mutateAsync({ product, isActive: !product.isActive });
      toast.success(`${product.name} ${product.isActive ? 'deactivated' : 'activated'}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to update status');
    } finally {
      setMenuOpenId(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogProduct(null);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerProduct(null);
  };

  const openCreateDialog = () => {
    setDialogProduct(null);
    setDialogOpen(true);
  };

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-rose-200 dark:border-rose-300/30 p-6">
        <p className="text-rose-500 font-semibold mb-4">Unable to load products.</p>
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
          <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Catalog</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage stock, BV, and prices for every SKU.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search by name or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button
            className="rounded-2xl bg-primary text-white text-sm font-semibold px-5 py-2.5 shadow-card"
            onClick={openCreateDialog}
          >
            Add product
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-white/5 shadow-card">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/5">
          <thead className="bg-slate-50 dark:bg-white/5">
            <tr>
              {['Product', 'BV', 'Stock', 'Actual price', 'Total price', 'Status', 'Actions'].map((heading) => (
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
                    <td colSpan={7} className="px-6 py-6">
                      <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt ?? product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-semibold text-slate-400">
                              1:1
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold capitalize text-slate-900 dark:text-white">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.bv}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.stock}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCurrency(product.actualPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCurrency(product.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.isActive ? statusStyles.active : statusStyles.inactive
                        }`}
                      >
                        {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteProduct.isPending}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-100 text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId((prev) => (prev === product.id ? null : product.id))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                            aria-haspopup="menu"
                            aria-expanded={menuOpenId === product.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {menuOpenId === product.id && (
                            <div className="absolute right-0 z-10 mt-2 w-36 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl">
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                                onClick={() => {
                                  handleView(product);
                                  setMenuOpenId(null);
                                }}
                              >
                                View
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                                onClick={() => {
                                  handleEdit(product);
                                  setMenuOpenId(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                                disabled={toggleStatus.isPending}
                                onClick={() => handleToggleStatus(product)}
                              >
                                {product.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {data && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              Showing {data.data.length} of {data.meta.total} products
            </span>
            <button className="text-primary font-semibold text-xs uppercase tracking-wide">View all</button>
          </div>
        )}
      </div>
      <ProductDialog open={isDialogOpen} onClose={handleDialogClose} product={dialogProduct} />
      <ProductDrawer open={isDrawerOpen} onClose={handleDrawerClose} product={drawerProduct} />
    </div>
  );
};

export { ProductsPage };
