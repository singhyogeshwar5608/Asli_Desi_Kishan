import { useMemo, useState } from 'react';
import type { ProductSummary } from '../../features/products/types';

interface Props {
  product?: ProductSummary | null;
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '—';
  return `$${value.toLocaleString()}`;
};

const ProductDrawer = ({ product, open, onClose }: Props) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = useMemo(() => product?.images ?? [], [product?.images]);

  if (!open || !product) return null;

  const activeImage = images[activeImageIndex];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/5 max-h-[82vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Product</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Overview</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-8 py-6 space-y-6 overflow-y-auto scrollbar-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">{product.name}</p>
              <p className="text-sm text-slate-400">SKU {product.sku}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                product.isActive
                  ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-300/10'
                  : 'text-slate-500 bg-slate-100 dark:text-slate-300 dark:bg-white/5'
              }`}
            >
              {product.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                {images.length > 1 && (
                  <div className="flex max-h-72 w-16 flex-col gap-3 overflow-y-auto pr-1 scrollbar-hidden" aria-label="Product thumbnails">
                    {images.map((image, index) => (
                      <button
                        key={`${image.url}-${index}`}
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-16 w-16 overflow-hidden rounded-2xl border transition ${
                          activeImageIndex === index
                            ? 'border-primary shadow-card'
                            : 'border-slate-200 dark:border-white/10 hover:border-primary/40'
                        }`}
                        aria-label={`Show image ${index + 1}`}
                      >
                        {image.url ? (
                          <img src={image.url} alt={image.alt ?? product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-slate-100 dark:bg-white/5 text-[10px] font-semibold flex items-center justify-center text-slate-400">
                            1:1
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1 max-w-xs rounded-3xl border border-slate-100 dark:border-white/5">
                  <div className="aspect-square w-full overflow-hidden rounded-[28px]">
                    {activeImage?.url ? (
                      <img src={activeImage.url} alt={activeImage.alt ?? product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-4">
              <p className="text-xs uppercase text-slate-400">Actual Price</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(product.actualPrice)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-4">
              <p className="text-xs uppercase text-slate-400">Total Price</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(product.totalPrice)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-4">
              <p className="text-xs uppercase text-slate-400">BV</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{product.bv.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-4">
              <p className="text-xs uppercase text-slate-400">Stock</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{product.stock.toLocaleString()}</p>
            </div>
          </div>

          {product.categories && product.categories.length > 0 && (
            <div>
              <p className="text-xs uppercase text-slate-400 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <p className="text-xs uppercase text-slate-400 mb-2">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export { ProductDrawer };
