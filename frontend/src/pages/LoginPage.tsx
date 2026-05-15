import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { login } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const storeLogin = useAuthStore((s) => s.login);
  const { t } = useTranslation();

  const signupSuccess = (location.state as { signupSuccess?: boolean } | null)?.signupSuccess;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    let hasError = false;
    if (!email) { setEmailError(t('auth.emailRequired')); hasError = true; }
    else { setEmailError(''); }
    if (!password) { setPasswordError(t('auth.passwordRequired')); hasError = true; }
    else { setPasswordError(''); }

    if (hasError) return;

    setIsLoading(true);
    try {
      const { token, user } = await login({ email, password });
      storeLogin(token, user);
      navigate('/todos', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setFormError(t('auth.loginError'));
      } else {
        setFormError(t('auth.loginGeneralError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-sub)' }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={32} strokeWidth={1.5} style={{ color: '#2563EB' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>할일목록 관리</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('auth.loginSubtitle')}</p>
        </div>

        <div
          className="rounded-xl p-8"
          style={{
            background: 'var(--color-bg)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid var(--color-border)',
          }}
        >
          {signupSuccess && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #16A34A' }}
            >
              {t('auth.signupSuccess')}
            </div>
          )}

          {formError && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #DC2626' }}
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              errorMessage={emailError}
              autoComplete="email"
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorMessage={passwordError}
              autoComplete="current-password"
            />
            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              {t('auth.login')}
            </Button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="font-semibold" style={{ color: '#2563EB' }}>
              {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
