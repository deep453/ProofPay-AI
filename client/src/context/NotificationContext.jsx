import { useState, useCallback } from 'react';

import { NotificationContext } from './NotificationContextValue';

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Verification Complete',
      message: 'AI Agent finished inspecting REST API Integration. 2 supported, 1 inconclusive.',
      time: '10m ago',
      read: false,
      type: 'warning',
      link: '/client/verifications'
    },
    {
      id: 'notif_2',
      title: 'Payment Received',
      message: 'PayPal payment $150.00 confirmed for Login Page Implementation.',
      time: '2h ago',
      read: false,
      type: 'success',
      link: '/client/payments'
    },
    {
      id: 'notif_3',
      title: 'Invoice Dispatched',
      message: 'Invoice #PP-2026-0045 sent for Authentication Module.',
      time: '1d ago',
      read: true,
      type: 'info',
      link: '/client/invoices'
    }
  ]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast_${Date.now()}`;
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
