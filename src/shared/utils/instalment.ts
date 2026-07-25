import type { Instalment } from '@/shared/types';

export type PaymentStatus = 'today' | 'upcoming';

export interface Payment {
  /** 0-based position in the schedule */
  index: number;
  date: Date;
  amount: number;
  status: PaymentStatus;
}

/**
 * `instalment.price` is the TOTAL amount over the whole term, not a monthly
 * figure (backend contract — see Muhlat-Savdo domain/Product.java). Monthly
 * payment is always derived, never stored.
 */
export function getMonthlyPayment(instalment: Instalment): number {
  if (!instalment.months) return instalment.price;
  return instalment.price / instalment.months;
}

/**
 * How much more the customer pays in total vs. paying cash today.
 * There is no separate "down payment" concept in this scheme (decision Q4) —
 * the first monthly payment itself is due on purchase day.
 */
export function getOverpayment(
  instalment: Instalment,
  basePrice: number,
): { amount: number; percent: number } {
  const amount = instalment.price - basePrice;
  const percent = basePrice > 0 ? (amount / basePrice) * 100 : 0;
  return { amount, percent };
}

/**
 * Adds `months` calendar months to `date`, clamping to the last day of the
 * target month when the original day doesn't exist there (e.g. Jan 31 + 1
 * month -> Feb 28/29, not an overflowed Mar 2/3).
 */
function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getDate();
  const firstOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDayOfTargetMonth = new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth(),
    Math.min(day, lastDayOfTargetMonth),
  );
}

/**
 * Builds the full payment schedule for an instalment plan. The first payment
 * (index 0) is due on `startDate` itself — the purchase day — every
 * subsequent one falls on the same day-of-month, `months` payments in total.
 */
export function buildPaymentSchedule(instalment: Instalment, startDate: Date = new Date()): Payment[] {
  const amount = getMonthlyPayment(instalment);
  return Array.from({ length: instalment.months }, (_, index) => ({
    index,
    date: index === 0 ? startDate : addMonthsClamped(startDate, index),
    amount,
    status: index === 0 ? 'today' : 'upcoming',
  }));
}
