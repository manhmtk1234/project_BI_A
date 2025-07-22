'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function TablesLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
