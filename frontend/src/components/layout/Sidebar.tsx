import { NavLink } from 'react-router-dom';
import { ListTodo, Tag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/category.types';
import { getCategoryName } from '../../utils/categoryUtils';
import { useLanguage } from '../../hooks/useLanguage';

const CATEGORY_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#0D9488', '#E11D48', '#D97706'];

interface SidebarProps {
  categories?: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { to: '/todos', labelKey: 'nav.todoList', icon: ListTodo },
  { to: '/categories', labelKey: 'nav.categories', icon: Tag },
  { to: '/settings', labelKey: 'nav.settings', icon: User },
];

export function Sidebar({ categories = [], isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    textDecoration: 'none',
    transition: 'background 100ms, color 100ms',
    backgroundColor: isActive ? 'var(--color-nav-active-bg)' : 'transparent',
    color: isActive ? 'var(--color-nav-active-text)' : 'var(--color-nav-text)',
    minHeight: 44,
  });

  return (
    <>
      {isOpen && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 z-40 overflow-y-auto transition-transform duration-[250ms] ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: 250,
          top: 56,
          height: 'calc(100vh - 56px)',
          background: 'var(--color-bg-sub)',
          borderRight: '1px solid var(--color-border)',
          padding: '24px 16px',
        }}
      >
        {categories.length > 0 && (
          <div className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t('nav.category')}
            </p>
            <ul>
              {categories.map((cat, index) => (
                <li key={cat.category_id}>
                  <div
                    className="flex items-center gap-2 px-2 py-2 rounded-[6px] text-sm transition-colors cursor-default min-h-[44px] hover:bg-[var(--color-hover)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span
                      data-testid="category-dot"
                      className="flex-shrink-0 rounded-full"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      }}
                    />
                    {getCategoryName(cat, currentLanguage)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <nav>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t('nav.menu')}
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, labelKey, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} style={navLinkStyle} onClick={() => onClose()}>
                  <Icon size={18} strokeWidth={1.5} />
                  {t(labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
