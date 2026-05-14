import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { signup } from '../api/authApi';

export function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string): string => {
    if (!value) return t('auth.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('auth.emailInvalid');
    return '';
  };

  const validatePassword = (value: string): string => {
    if (!value) return t('auth.passwordRequired');
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value)) return t('auth.passwordPolicy');
    return '';
  };

  const validateName = (value: string): string => {
    if (!value) return t('auth.nameRequired');
    if (value.length > 50) return t('auth.nameTooLong');
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const nameErr = validateName(name);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setNameError(nameErr);

    if (emailErr || passwordErr || nameErr) return;

    setIsLoading(true);
    try {
      await signup({ email, password, name });
      navigate('/login', { state: { signupSuccess: true } });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setEmailError(t('auth.emailDuplicate'));
        } else if (err.response?.status === 400) {
          setPasswordError(t('auth.passwordPolicy'));
        }
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
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>TodoListApp</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('auth.signupSubtitle')}</p>
        </div>

        <div
          className="rounded-xl p-8"
          style={{
            background: 'var(--color-bg)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid var(--color-border)',
          }}
        >
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
              autoComplete="new-password"
            />
            <Input
              label={t('auth.name')}
              type="text"
              placeholder={t('auth.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              errorMessage={nameError}
              autoComplete="name"
            />
            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              {t('auth.signupButton')}
            </Button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--color-text-muted)' }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#2563EB' }}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
