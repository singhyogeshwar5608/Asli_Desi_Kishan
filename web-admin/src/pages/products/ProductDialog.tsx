import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  useCreateProduct,
  useUpdateProduct,
  useUploadProductMedia,
  type UploadedProductMedia,
} from '../../features/products/api';
import type { ProductSummary } from '../../features/products/types';
import type { CategorySummary } from '../../features/categories/types';
import { useCategoryOptions } from '../../features/categories/api';

interface Props {
  open: boolean;
  onClose: () => void;
  product?: ProductSummary | null;
}

type ImageInput = { url: string; alt: string };

type FormState = {
  name: string;
  sku: string;
  actualPrice: string;
  totalPrice: string;
  bv: string;
  stock: string;
  description: string;
  categories: string[];
  isActive: boolean;
  images: ImageInput[];
};

const createInitialState = (): FormState => ({
  name: '',
  sku: '',
  actualPrice: '',
  totalPrice: '',
  bv: '',
  stock: '',
  description: '',
  categories: [],
  isActive: true,
  images: [],
});

const ProductDialog = ({ open, onClose, product }: Props) => {
  const [form, setForm] = useState<FormState>(createInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isDragActive, setDragActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const uploadMediaMutation = useUploadProductMedia();
  const { reset: resetCreateProduct } = createMutation;
  const { reset: resetUpdateProduct } = updateMutation;
  const { reset: resetUploadMedia } = uploadMediaMutation;
  const isEditMode = Boolean(product?.id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const {
    data: categoryOptions,
    isLoading: isLoadingCategories,
    isError: categoryError,
    refetch: refetchCategories,
  } = useCategoryOptions({ enabled: open });
  const availableCategories = useMemo(() => {
    if (!categoryOptions) return [] as CategorySummary[];
    return [...categoryOptions].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryOptions]);
  const previewImages = useMemo(() => form.images.filter((image) => image.url.trim().length > 0), [form.images]);
  const activePreviewImage = previewImages[activePreviewIndex];

  useEffect(() => {
    if (!open) {
      setForm(createInitialState());
      setErrors({});
      setDragActive(false);
      setCategoryDropdownOpen(false);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setActivePreviewIndex(0);
      resetCreateProduct();
      resetUpdateProduct();
      resetUploadMedia();
      return;
    }

    if (product) {
      setForm({
        name: product.name ?? '',
        sku: product.sku ?? '',
        actualPrice: product.actualPrice?.toString() ?? '',
        totalPrice: product.totalPrice?.toString() ?? '',
        bv: product.bv?.toString() ?? '',
        stock: product.stock?.toString() ?? '',
        description: product.description ?? '',
        categories: product.categories?.map((value) => value.trim()).filter(Boolean) ?? [],
        isActive: product.isActive ?? true,
        images:
          product.images?.map((image) => ({
            url: image.url ?? '',
            alt: image.alt ?? '',
          })) ?? [],
      });
    } else {
      setForm(createInitialState());
    }
    setErrors({});
    setActivePreviewIndex(0);
  }, [open, product, resetCreateProduct, resetUpdateProduct, resetUploadMedia]);

  useEffect(() => {
    setActivePreviewIndex((prev) => {
      if (previewImages.length === 0) return 0;
      return Math.min(prev, previewImages.length - 1);
    });
  }, [previewImages.length]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition((prev) => {
        const { startX, startY, initialX, initialY } = dragStartRef.current;
        return {
          x: initialX + (event.clientX - startX),
          y: initialY + (event.clientY - startY),
        };
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

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(event.target as Node)) return;
      setCategoryDropdownOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDropdownOpen]);

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.actualPrice || Number(form.actualPrice) <= 0) errs.actualPrice = 'Actual price must be > 0';
    if (!form.totalPrice || Number(form.totalPrice) <= 0) errs.totalPrice = 'Total price must be > 0';
    if (!form.bv || Number(form.bv) < 0) errs.bv = 'BV must be >= 0';
    if (!form.stock || Number(form.stock) < 0) errs.stock = 'Stock must be >= 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (key: keyof typeof form, value: string | boolean | ImageInput[] | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (index: number, field: keyof ImageInput, value: string) => {
    const next = [...form.images];
    next[index] = { ...next[index], [field]: value };
    handleChange('images', next);
  };

  const appendUploaded = (uploads: UploadedProductMedia[]) => {
    const mapped = uploads.map((file) => ({
      url: file.url,
      alt: file.name ?? '',
    }));
    handleChange('images', [...form.images, ...mapped]);
  };

  const handleUploadImages = async (files: File[] | FileList | null) => {
    const fileArray = Array.isArray(files) ? files : files ? Array.from(files) : [];
    if (!fileArray.length) return;
    try {
      const uploaded = await uploadMediaMutation.mutateAsync(fileArray);
      appendUploaded(uploaded);
      toast.success(`Uploaded ${uploaded.length} file(s)`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to upload images');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addImageField = () => {
    handleChange('images', [...form.images, { url: '', alt: '' }]);
  };

  const removeImageField = (index: number) => {
    const next = [...form.images];
    next.splice(index, 1);
    handleChange('images', next);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    await handleUploadImages(event.dataTransfer.files);
  };

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

  const toggleCategory = (name: string) => {
    setForm((prev) => {
      const exists = prev.categories.includes(name);
      const next = exists ? prev.categories.filter((value) => value !== name) : [...prev.categories, name];
      return { ...prev, categories: next };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      actualPrice: Number(form.actualPrice),
      totalPrice: Number(form.totalPrice),
      bv: Number(form.bv),
      stock: Number(form.stock),
      description: form.description.trim() || undefined,
      categories: form.categories,
      images: form.images
        .filter((img) => img.url.trim())
        .map((img) => ({ url: img.url.trim(), alt: img.alt.trim() || undefined })),
      isActive: form.isActive,
    };

    try {
      if (isEditMode && product) {
        await updateMutation.mutateAsync({ id: product.id, payload });
        toast.success(`${form.name} updated`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${form.name} created`);
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to create product');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const hasError = createMutation.isError || updateMutation.isError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div
        className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 w-full max-w-2xl max-h-[85vh] flex flex-col"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div
          className={`flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-move'
          }`}
          onMouseDown={handleDragStart}
        >
          <div>
            <p className="text-xs uppercase text-slate-400 tracking-[0.4em]">Catalog</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit product' : 'Add product'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 overflow-y-auto scrollbar-hidden flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Title"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.sku && <p className="mt-1 text-xs text-rose-500">{errors.sku}</p>}
            </div>
            <div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Actual price"
                value={form.actualPrice}
                onChange={(e) => handleChange('actualPrice', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.actualPrice && <p className="mt-1 text-xs text-rose-500">{errors.actualPrice}</p>}
            </div>
            <div>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Total price"
                value={form.totalPrice}
                onChange={(e) => handleChange('totalPrice', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.totalPrice && <p className="mt-1 text-xs text-rose-500">{errors.totalPrice}</p>}
            </div>
            <div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="BV"
                value={form.bv}
                onChange={(e) => handleChange('bv', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.bv && <p className="mt-1 text-xs text-rose-500">{errors.bv}</p>}
            </div>
            <div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {errors.stock && <p className="mt-1 text-xs text-rose-500">{errors.stock}</p>}
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Categories</span>
                {form.categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleChange('categories', [])}
                    className="text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-transparent px-4 py-2.5 text-left text-sm text-slate-900 dark:border-white/10 dark:text-white"
                  aria-haspopup="listbox"
                  aria-expanded={categoryDropdownOpen}
                >
                  {form.categories.length === 0 ? (
                    <span className="text-slate-400">Select categories</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {form.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="ml-auto text-slate-400">▾</span>
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute left-0 right-0 z-10 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    {isLoadingCategories && (
                      <p className="px-2 py-3 text-sm text-slate-500">Loading categories…</p>
                    )}
                    {categoryError && !isLoadingCategories && (
                      <div className="space-y-2 px-2 py-3 text-sm text-rose-500">
                        <p>Failed to load categories.</p>
                        <button
                          type="button"
                          onClick={() => refetchCategories()}
                          className="text-xs font-semibold text-primary"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    {!isLoadingCategories && !categoryError && availableCategories.length === 0 && (
                      <p className="px-2 py-3 text-sm text-slate-500">No active categories found.</p>
                    )}
                    {!isLoadingCategories && !categoryError && (
                      <ul className="space-y-1" role="listbox">
                        {availableCategories.map((category) => {
                          const selected = form.categories.includes(category.name);
                          return (
                            <li key={category.id}>
                              <button
                                type="button"
                                onClick={() => toggleCategory(category.name)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm ${
                                  selected
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5'
                                }`}
                              >
                                <span>{category.name}</span>
                                {selected && <span>✓</span>}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <textarea
              placeholder="Describe the product"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Product images</p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={(event) => handleUploadImages(event.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-200 hover:border-primary"
                  disabled={uploadMediaMutation.isPending}
                >
                  {uploadMediaMutation.isPending ? 'Uploading…' : 'Upload files'}
                </button>
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-3xl border border-dashed p-4 text-center text-sm transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-500'
              }`}
            >
              {isDragActive ? 'Release to upload your files…' : 'Drag & drop images here or use the button above. Images will appear once Cloudinary upload succeeds.'}
            </div>

            <div className="space-y-3">
              {form.images.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-white/5 px-3 py-2"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
                    {image.url ? (
                      <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={image.url}
                      onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={image.alt}
                      onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="h-8 w-8 rounded-full border border-rose-100 text-rose-500 hover:bg-rose-50"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.images.length === 0 && (
                <p className="text-xs text-slate-400">No images yet. Upload files or add manually.</p>
              )}
              <button
                type="button"
                onClick={addImageField}
                className="text-xs font-semibold text-primary"
              >
                + Add image manually
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            Active product
          </label>

          {hasError && <p className="text-sm text-rose-500">Something went wrong. Please try again.</p>}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-sm font-semibold text-slate-500 hover:text-slate-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-card disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { ProductDialog };
