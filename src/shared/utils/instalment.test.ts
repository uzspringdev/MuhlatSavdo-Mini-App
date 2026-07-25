import { describe, it, expect } from 'vitest';
import { getMonthlyPayment, getOverpayment, buildPaymentSchedule } from './instalment';

describe('getMonthlyPayment', () => {
  it('divides total price by months', () => {
    expect(getMonthlyPayment({ price: 1000, months: 10 })).toBe(100);
  });

  it('falls back to the full price when months is 0', () => {
    expect(getMonthlyPayment({ price: 500, months: 0 })).toBe(500);
  });
});

describe('getOverpayment', () => {
  it('returns 0 when the instalment price equals the base price', () => {
    expect(getOverpayment({ price: 1000, months: 10 }, 1000)).toEqual({ amount: 0, percent: 0 });
  });

  it('computes amount and percent when instalment price is higher', () => {
    const result = getOverpayment({ price: 1180, months: 10 }, 1000);
    expect(result.amount).toBe(180);
    expect(result.percent).toBe(18);
  });

  it('does not divide by zero when basePrice is 0', () => {
    expect(getOverpayment({ price: 100, months: 5 }, 0)).toEqual({ amount: 100, percent: 0 });
  });
});

describe('buildPaymentSchedule', () => {
  it('produces one entry per month, each with the monthly amount', () => {
    const start = new Date(2026, 0, 15); // 15 Jan 2026
    const schedule = buildPaymentSchedule({ price: 1000, months: 10 }, start);

    expect(schedule).toHaveLength(10);
    schedule.forEach((payment) => expect(payment.amount).toBe(100));
  });

  it('dates the first payment on the purchase day itself', () => {
    const start = new Date(2026, 0, 15);
    const [first] = buildPaymentSchedule({ price: 1000, months: 10 }, start);

    expect(first.date).toEqual(start);
    expect(first.status).toBe('today');
    expect(first.index).toBe(0);
  });

  it('marks every payment after the first as upcoming, one calendar month apart', () => {
    const start = new Date(2026, 0, 15);
    const schedule = buildPaymentSchedule({ price: 1000, months: 3 }, start);

    expect(schedule[1].status).toBe('upcoming');
    expect(schedule[1].date).toEqual(new Date(2026, 1, 15));
    expect(schedule[2].date).toEqual(new Date(2026, 2, 15));
  });

  it('clamps end-of-month overflow instead of rolling into the next month', () => {
    // 31 Jan 2026 + 1 month must land on Feb 28 (2026 is not a leap year),
    // not overflow to Mar 2/3 the way naive setMonth() arithmetic would.
    const start = new Date(2026, 0, 31);
    const schedule = buildPaymentSchedule({ price: 200, months: 2 }, start);

    expect(schedule[1].date).toEqual(new Date(2026, 1, 28));
  });

  it('clamps to Feb 29 in a leap year', () => {
    const start = new Date(2028, 0, 31); // 2028 is a leap year
    const schedule = buildPaymentSchedule({ price: 200, months: 2 }, start);

    expect(schedule[1].date).toEqual(new Date(2028, 1, 29));
  });

  it('returns an empty schedule when months is 0', () => {
    expect(buildPaymentSchedule({ price: 500, months: 0 })).toEqual([]);
  });
});
