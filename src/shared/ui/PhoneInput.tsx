import { clsx } from 'clsx';

interface PhoneInputProps {
  /** Up to 9 raw digits, no +998 prefix */
  value: string;
  onChange: (digits: string) => void;
  error?: string;
  autoFocus?: boolean;
  /** 'lg' matches the login screen's oversized input, 'md' matches inline forms */
  size?: 'md' | 'lg';
  id?: string;
}

function formatUzPhone(digits: string): string {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

export function PhoneInput({ value, onChange, error, autoFocus, size = 'md', id }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, '').slice(0, 9));
  };

  const isLg = size === 'lg';

  return (
    <div>
      <div className="relative group">
        <span
          className={clsx(
            'absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-500 dark:text-neutral-400 group-focus-within:text-di-red transition-colors pointer-events-none',
            isLg ? 'text-sm' : 'text-sm',
          )}
        >
          +998
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          placeholder="00 000 00 00"
          value={formatUzPhone(value)}
          onChange={handleChange}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          className={clsx(
            'w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 outline-none font-bold tracking-wider text-neutral-900 dark:text-white transition-all',
            isLg ? 'pl-20 pr-4 h-16 text-lg border-2' : 'pl-16 pr-4 py-3 text-sm border',
            error
              ? 'border-di-red'
              : 'border-transparent focus:border-di-red focus:bg-white dark:focus:bg-neutral-950',
          )}
        />
      </div>
      {error && <p className="mt-1.5 px-1 text-xs font-semibold text-di-red">{error}</p>}
    </div>
  );
}
