import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import type { Instalment } from '@/shared/types';
import { formatPrice } from '@/shared/utils';
import { getMonthlyPayment, buildPaymentSchedule } from '@/shared/utils/instalment';
import { useT, useLangStore, type Lang } from '@/shared/i18n';

interface InstalmentCalculatorProps {
  instalments: Instalment[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  currency: 'UZS' | 'USD' | 'RUB';
}

function formatScheduleDate(date: Date, lang: Lang): string {
  const locale = lang === 'uz' ? 'uz-Latn' : 'ru-RU';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(date);
}

export function InstalmentCalculator({
  instalments,
  selectedIndex,
  onSelect,
  currency,
}: InstalmentCalculatorProps) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const [showSchedule, setShowSchedule] = useState(false);

  const selected = instalments[selectedIndex];
  const monthly = useMemo(() => getMonthlyPayment(selected), [selected]);
  const schedule = useMemo(() => buildPaymentSchedule(selected), [selected]);

  if (!selected) return null;

  return (
    <div className="space-y-3">
      <p className="text-caption text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
        {t('product.instalment')}
      </p>

      {/* Term picker */}
      <div className="flex flex-wrap gap-2">
        {instalments.map((plan, i) => (
          <button
            key={plan.months}
            onClick={() => onSelect(i)}
            className={clsx(
              'flex-1 min-w-[70px] min-h-[44px] px-3 py-2 rounded-el border text-center transition-colors',
              // Amber, not red — rassrochka is a different kind of signal than a discount
              i === selectedIndex
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400',
            )}
          >
            <p className="text-xs font-black">{t('product.instalmentMonths', { months: plan.months })}</p>
          </button>
        ))}
      </div>

      {/* Calculator summary — the monthly payment leads, everything else supports it */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-card p-4 space-y-2">
        <div className="text-2xl font-black text-di-red dark:text-di-red-light leading-tight">
          {t('product.perMonth', { price: formatPrice(monthly, currency, lang) })}
        </div>
        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {t('product.payToday', { price: formatPrice(monthly, currency, lang) })}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {t('product.instalmentSummary', {
            months: selected.months,
            total: formatPrice(selected.price, currency, lang),
          })}
        </p>
        <button
          onClick={() => setShowSchedule(true)}
          className="w-full min-h-[44px] mt-1 text-xs font-bold text-di-red uppercase tracking-wider underline underline-offset-2"
        >
          {t('product.viewSchedule')}
        </button>
      </div>

      {showSchedule && (
        <div className="fixed inset-0 z-[200] flex items-end" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSchedule(false)}
          />
          <div className="relative w-full bg-white dark:bg-neutral-900 rounded-t-card max-h-[75vh] overflow-y-auto safe-bottom">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 px-4 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                {t('product.scheduleTitle')}
              </h3>
              <button
                onClick={() => setShowSchedule(false)}
                aria-label={t('common.close')}
                className="w-11 h-11 -mr-2 flex items-center justify-center text-neutral-500 dark:text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-2 divide-y divide-neutral-100 dark:divide-neutral-800">
              {schedule.map((payment) => (
                <div key={payment.index} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {t('product.paymentN', { n: payment.index + 1 })}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {payment.status === 'today' ? t('common.today') : formatScheduleDate(payment.date, lang)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {formatPrice(payment.amount, currency, lang)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
