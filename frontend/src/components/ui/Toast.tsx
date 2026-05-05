import { useUIStore } from '../../store/uiStore';

const TYPE_CONFIG = {
  success: { bg: 'bg-green-50 border-green-200', icon: 'text-green-400', text: 'text-green-800', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  error: { bg: 'bg-red-50 border-red-200', icon: 'text-red-400', text: 'text-red-800', iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-400', text: 'text-yellow-800', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  info: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-400', text: 'text-blue-800', iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const cfg = TYPE_CONFIG[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${cfg.bg}`}
          >
            <svg className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cfg.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={cfg.iconPath} />
            </svg>
            <p className={`flex-1 text-sm font-medium ${cfg.text}`}>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 ${cfg.text} opacity-70 hover:opacity-100 transition-opacity`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
