import { CheckSquare, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { logout as apiLogout } from '../../api/authApi';

interface HeaderProps {
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ onMenuClick, theme, onToggleTheme }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      queryClient.clear();
      navigate('/login');
    }
  };

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6"
      style={{
        height: 56,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-[6px] transition-colors hover:bg-[var(--color-hover)]"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={t('nav.openMenu')}
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <CheckSquare size={24} strokeWidth={1.5} style={{ color: '#2563EB' }} />
          <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            TodoList
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
            {user.name}
          </span>
        )}
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label={t('language.select')}
          className="h-9 px-2 rounded-[6px] text-sm outline-none border cursor-pointer"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <option value="ko">{t('language.ko')}</option>
          <option value="en">{t('language.en')}</option>
          <option value="zh">{t('language.zh')}</option>
        </select>
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-[6px] transition-colors hover:bg-[var(--color-hover)]"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={theme === 'dark' ? t('nav.lightModeOn') : t('nav.darkModeOn')}
        >
          {theme === 'dark' ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 rounded-[6px] text-sm font-semibold transition-colors hover:bg-[var(--color-hover)]"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={t('auth.logout')}
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="hidden sm:block">{t('auth.logout')}</span>
        </button>
      </div>
    </header>
  );
}
