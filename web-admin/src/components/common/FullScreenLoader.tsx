interface FullScreenLoaderProps {
  message?: string;
}

export const FullScreenLoader = ({ message = 'Loading...' }: FullScreenLoaderProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-white">
      <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-6" />
      <p className="text-sm uppercase tracking-[0.2em]" role="status">
        {message}
      </p>
    </div>
  );
};
