import ReactDatePicker from 'react-datepicker';
import { ko, enUS, zhCN } from 'date-fns/locale';
import { useLanguage } from '../../hooks/useLanguage';
import 'react-datepicker/dist/react-datepicker.css';

const LOCALE_MAP = { ko, en: enUS, zh: zhCN } as const;

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DatePicker({ id, value, onChange, className, style }: DatePickerProps) {
  const { currentLanguage } = useLanguage();
  const locale = LOCALE_MAP[currentLanguage as keyof typeof LOCALE_MAP] ?? ko;

  const selected = value ? new Date(value) : null;

  const handleChange = (date: Date | null) => {
    if (!date) { onChange(''); return; }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <ReactDatePicker
      id={id}
      selected={selected}
      onChange={handleChange}
      locale={locale}
      dateFormat="yyyy-MM-dd"
      className={className}
      style={style}
      placeholderText="yyyy-MM-dd"
      autoComplete="off"
    />
  );
}
