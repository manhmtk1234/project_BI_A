"use client";
import React, { createContext, useContext, useState } from 'react';

export interface Notification {
  tableId: number;
  tableName: string;
  message: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};