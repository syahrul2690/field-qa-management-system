import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../services/reviewApi';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'ACTION_REQUIRED' | 'STAGE_UPDATED' | 'STATUS_UPDATED' | 'OVERDUE';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  review_id: string;
  document_title: string;
  document_number: string;
  section: string;
  project_name: string;
  current_stage: string | null;
  final_status: string | null;
  is_overdue: boolean;
  updated_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: string; dot: string; iconBg: string; border: string; label: string }> = {
  OVERDUE: {
    icon: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    dot: 'bg-red-500',
    iconBg: 'bg-red-100 text-red-600',
    border: 'border-l-red-400',
    label: 'Overdue',
  },
  ACTION_REQUIRED: {
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-600',
    border: 'border-l-amber-400',
    label: 'Action Required',
  },
  STAGE_UPDATED: {
    icon: 'M9 5l7 7-7 7',
    dot: 'bg-blue-500',
    iconBg: 'bg-blue-100 text-blue-600',
    border: 'border-l-blue-400',
    label: 'Stage Updated',
  },
  STATUS_UPDATED: {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    dot: 'bg-green-500',
    iconBg: 'bg-green-100 text-green-600',
    border: 'border-l-green-400',
    label: 'Status Updated',
  },
};

const SECTION_LABEL: Record<string, string> = {
  FIELD_ITP: 'Field ITP',
  PROCEDURE: 'Procedure',
  WORK_METHOD: 'Work Method',
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED_A: 'Status A — Approved',
  APPROVED_WITH_COMMENTS_B: 'Status B — Approved w/ Comments',
  REJECTED_C: 'Status C — Revise & Resubmit',
  SUPERSEDED: 'Superseded',
};

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

function NotificationItem({
  notif,
  isRead,
  onClick,
}: {
  notif: Notification;
  isRead: boolean;
  onClick: () => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];

  // Unread rows get a tinted background; read rows are plain white
  const unreadBg: Record<NotificationType, string> = {
    OVERDUE: 'bg-red-50',
    ACTION_REQUIRED: 'bg-amber-50',
    STAGE_UPDATED: 'bg-blue-50',
    STATUS_UPDATED: 'bg-green-50',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-b border-gray-100 last:border-0 px-4 py-3.5 transition-colors group border-l-4 ${cfg.border} ${
        isRead
          ? 'bg-white hover:bg-gray-50 border-l-gray-200'
          : `${unreadBg[notif.type]} hover:brightness-95`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${cfg.iconBg} ${isRead ? 'opacity-60' : ''}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p className={`text-xs leading-tight ${isRead ? 'font-medium text-gray-400' : 'font-bold text-gray-900'}`}>
              {STATUS_LABEL[notif.title] ?? notif.title}
            </p>
            {!isRead && (
              <span className={`flex-shrink-0 h-2.5 w-2.5 rounded-full mt-0.5 animate-pulse ${cfg.dot}`} />
            )}
          </div>
          <p className={`text-xs leading-relaxed line-clamp-2 ${isRead ? 'text-gray-400' : 'text-gray-600'}`}>{notif.body}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isRead ? 'text-gray-400 bg-gray-100' : 'text-gray-600 bg-white/70 border border-gray-200'}`}>
              {notif.document_number}
            </span>
            {notif.section && (
              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                {SECTION_LABEL[notif.section] ?? notif.section}
              </span>
            )}
            {notif.is_overdue && (
              <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-bold">
                OVERDUE
              </span>
            )}
            <span className={`text-[10px] ml-auto ${isRead ? 'text-gray-400' : 'text-gray-500 font-medium'}`}>{timeAgo(notif.updated_at)}</span>
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${isRead ? 'text-gray-400' : 'text-gray-500'}`}>{notif.project_name}</p>
        </div>
      </div>
    </button>
  );
}

// ─── NotificationCenter ───────────────────────────────────────────────────────

export function NotificationCenter() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Scope read-state by user so different users on the same browser don't share it
  const storageKey = `notif_read_ids_${user?.id ?? 'guest'}`;

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`notif_read_ids_${user?.id ?? 'guest'}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => reviewApi.notifications(),
    refetchInterval: 30_000,
    enabled: !!user,
    staleTime: 15_000,
  });

  const notifications: Notification[] = data?.data?.data ?? [];
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // Close panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const markAllRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    const newSet = new Set([...readIds, ...allIds]);
    setReadIds(newSet);
    localStorage.setItem(storageKey, JSON.stringify([...newSet]));
  }, [notifications, readIds, storageKey]);

  const markRead = useCallback((id: string) => {
    const newSet = new Set([...readIds, id]);
    setReadIds(newSet);
    localStorage.setItem(storageKey, JSON.stringify([...newSet]));
  }, [readIds, storageKey]);

  const handleClick = useCallback((notif: Notification) => {
    markRead(notif.id);
    setOpen(false);
    navigate(`/reviews/${notif.review_id}`);
  }, [navigate, markRead]);

  // Group notifications by type
  const grouped: Record<NotificationType, Notification[]> = {
    OVERDUE: [],
    ACTION_REQUIRED: [],
    STAGE_UPDATED: [],
    STATUS_UPDATED: [],
  };
  notifications.forEach((n) => grouped[n.type].push(n));

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            // Refresh when opening
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
          }
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border border-gray-200 bg-white overflow-hidden z-50"
          style={{ animation: 'slideDown 0.15s ease-out' }}>

          {/* Header */}
          <div className="px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gray-800 flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Notifications</p>
                <p className="text-[10px] text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[28rem] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">Loading notifications...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-14 px-6 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending actions or recent updates.</p>
              </div>
            ) : (
              <>
                {/* Overdue section */}
                {grouped.OVERDUE.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        Overdue ({grouped.OVERDUE.length})
                      </p>
                    </div>
                    {grouped.OVERDUE.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notif={n}
                        isRead={readIds.has(n.id)}
                        onClick={() => handleClick(n)}
                      />
                    ))}
                  </div>
                )}

                {/* Action Required section */}
                {grouped.ACTION_REQUIRED.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Action Required ({grouped.ACTION_REQUIRED.length})
                      </p>
                    </div>
                    {grouped.ACTION_REQUIRED.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notif={n}
                        isRead={readIds.has(n.id)}
                        onClick={() => handleClick(n)}
                      />
                    ))}
                  </div>
                )}

                {/* Stage/Status Updates */}
                {(grouped.STAGE_UPDATED.length > 0 || grouped.STATUS_UPDATED.length > 0) && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Recent Updates ({grouped.STAGE_UPDATED.length + grouped.STATUS_UPDATED.length})
                      </p>
                    </div>
                    {[...grouped.STAGE_UPDATED, ...grouped.STATUS_UPDATED]
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .map((n) => (
                        <NotificationItem
                          key={n.id}
                          notif={n}
                          isRead={readIds.has(n.id)}
                          onClick={() => handleClick(n)}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => { setOpen(false); navigate('/reviews'); }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View all reviews →
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
