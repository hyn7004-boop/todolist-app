import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../hooks/useTheme';
import type { Category } from '../../types/category.types';

interface LayoutProps {
  categories?: Category[];
}

export function Layout({ categories = [] }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Header
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggle}
      />
      <Sidebar
        categories={categories}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        className="lg:ml-[250px] p-4 md:p-6 lg:p-8"
        style={{ minHeight: 'calc(100vh - 56px)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
