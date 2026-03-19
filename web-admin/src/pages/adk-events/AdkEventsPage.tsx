import { useMemo, useState } from 'react';
import { Calendar, Loader2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../components/modal';
import { useAdkEvents, useCreateAdkEvent, useDeleteAdkEvent, useUpdateAdkEvent } from '../../features/adk-events/api';
import type { AdkEvent, AdkEventFilters, AdkEventPayload } from '../../features/adk-events/types';

const defaultPayload: AdkEventPayload = {
  leaderName: '',
  meetingDate: '',
  meetingTime: '',
  storeName: '',
  address: '',
  state: '',
  city: '',
  leaderMobile: '',
  storeMobile: '',
  notes: '',
};

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}

const TextField = ({ label, value, onChange, type = 'text', required, multiline }: TextFieldProps) => (
  <label className="flex flex-col rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-500 focus-within:border-primary dark:border-white/10">
    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    {multiline ? (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="min-h-[80px] border-none bg-transparent text-slate-700 outline-none dark:text-white"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="border-none bg-transparent text-slate-700 outline-none dark:text-white"
      />
    )}
  </label>
);

export const AdkEventsPage = () => {
  const [filters, setFilters] = useState<AdkEventFilters>({ page: 1, limit: 10, search: '' });
  const [draftFilters, setDraftFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [isFormOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<AdkEventPayload>(defaultPayload);
  const [editingEvent, setEditingEvent] = useState<AdkEvent | null>(null);
  const { data, isLoading, isFetching, refetch, isError } = useAdkEvents(filters);
  const createMutation = useCreateAdkEvent();
  const updateMutation = useUpdateAdkEvent();
  const deleteMutation = useDeleteAdkEvent();

  const events = data?.data ?? [];
  const meta = data?.meta;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const paginationLabel = useMemo(() => {
    if (!meta) return '';
    const start = (meta.currentPage - 1) * meta.perPage + 1;
    const end = Math.min(meta.currentPage * meta.perPage, meta.total);
    return `Showing ${start}-${end} of ${meta.total}`;
  }, [meta]);
  const canPrev = !!meta && meta.currentPage > 1;
  const canNext = !!meta && meta.currentPage < meta.lastPage;

  const handleFilterApply = () => {
    setFilters((prev) => ({
      ...prev,
      search: draftFilters.search.trim() || undefined,
      startDate: draftFilters.startDate || undefined,
      endDate: draftFilters.endDate || undefined,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setDraftFilters({ search: '', startDate: '', endDate: '' });
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (!meta) return;
    setFilters((prev) => ({
      ...prev,
      page: direction === 'prev' ? Math.max(1, meta.currentPage - 1) : Math.min(meta.lastPage, meta.currentPage + 1),
    }));
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormValues(defaultPayload);
    setFormOpen(true);
  };

  const openEditModal = (event: AdkEvent) => {
    setEditingEvent(event);
    setFormValues({
      leaderName: event.leaderName,
      meetingDate: event.meetingDate,
      meetingTime: event.meetingTime,
      storeName: event.storeName,
      address: event.address,
      state: event.state,
      city: event.city,
      leaderMobile: event.leaderMobile,
      storeMobile: event.storeMobile,
      notes: event.notes ?? '',
    });
    setFormOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setFormOpen(false);
  };

  const handleChange = <K extends keyof AdkEventPayload>(field: K, value: AdkEventPayload[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingEvent) {
        await updateMutation.mutateAsync({ id: editingEvent.id, payload: formValues });
        toast.success('Event updated');
      } else {
        await createMutation.mutateAsync(formValues);
        toast.success('Event created');
      }
      setFormOpen(false);
      setEditingEvent(null);
      setFormValues(defaultPayload);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to save event');
    }
  };

  const handleDelete = async (event: AdkEvent) => {
    const confirmed = window.confirm(`Delete event for ${event.leaderName}?`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(event.id);
      toast.success('Event removed');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">ADM Events</h1>
          <p className="text-sm text-slate-500">Manage leader meetups, venues, and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 focus-within:border-primary dark:border-white/10">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <Search size={16} />
              <input
                type="text"
                value={draftFilters.search}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search leader, state, city"
                className="flex-1 border-none bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>
          </div>
          <div className="flex flex-1 flex-col gap-2 lg:flex-row">
            <DateInput
              label="Start date"
              value={draftFilters.startDate}
              onChange={(value) => setDraftFilters((prev) => ({ ...prev, startDate: value }))}
            />
            <DateInput
              label="End date"
              value={draftFilters.endDate}
              onChange={(value) => setDraftFilters((prev) => ({ ...prev, endDate: value }))}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={handleFilterApply} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            Apply filters
          </button>
          <button onClick={handleResetFilters} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm dark:bg-slate-900 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['Leader Name', 'Date', 'Time', 'Store Name', 'City', 'Actions'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Loading events…
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    {isError ? 'Unable to load events' : 'No events found'}
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{event.leaderName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{event.meetingDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{event.meetingTime}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{event.storeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{event.city}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {paginationLabel && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-xs text-slate-500">{paginationLabel}</p>
            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() => handlePageChange('prev')}
                className="rounded-full border border-slate-200 px-4 py-1 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={!canNext}
                onClick={() => handlePageChange('next')}
                className="rounded-full border border-slate-200 px-4 py-1 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {isFormOpen && (
        <Modal onClose={closeModal} title={editingEvent ? 'Edit Event' : 'Add Event'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Leader Name"
              value={formValues.leaderName}
              onChange={(value) => handleChange('leaderName', value)}
              required
            />
            <TextField
              label="Store Name"
              value={formValues.storeName}
              onChange={(value) => handleChange('storeName', value)}
              required
            />
            <TextField
              label="Meeting Date"
              type="date"
              value={formValues.meetingDate}
              onChange={(value) => handleChange('meetingDate', value)}
              required
            />
            <TextField
              label="Meeting Time"
              type="time"
              value={formValues.meetingTime}
              onChange={(value) => handleChange('meetingTime', value)}
              required
            />
            <TextField
              label="City"
              value={formValues.city}
              onChange={(value) => handleChange('city', value)}
              required
            />
            <TextField
              label="State"
              value={formValues.state}
              onChange={(value) => handleChange('state', value)}
              required
            />
            <TextField
              label="Leader Mobile"
              value={formValues.leaderMobile}
              onChange={(value) => handleChange('leaderMobile', value)}
              required
            />
            <TextField
              label="Store Mobile"
              value={formValues.storeMobile}
              onChange={(value) => handleChange('storeMobile', value)}
              required
            />
          </div>
          <TextField
            label="Address"
            value={formValues.address}
            onChange={(value) => handleChange('address', value)}
            required
            multiline
          />
          <TextField
            label="Notes"
            value={formValues.notes ?? ''}
            onChange={(value) => handleChange('notes', value)}
            multiline
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {editingEvent ? 'Save changes' : 'Create event'}
            </button>
          </div>  
          </form>
        </Modal>
      )}
    </div>
  );
};

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const DateInput = ({ label, value, onChange }: DateInputProps) => {
  return (
    <label className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-500 focus-within:border-primary dark:border-white/10">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-slate-400" />
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 border-none bg-transparent text-slate-700 outline-none dark:text-white"
        />
      </div>
    </label>
  );
};
