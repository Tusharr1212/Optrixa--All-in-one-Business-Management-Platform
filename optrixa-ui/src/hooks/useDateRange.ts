import { useState, useMemo } from 'react';

export type Period = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'custom';

export const useDateRange = (defaultPeriod: Period = 'month') => {
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { fromDate, toDate, label } = useMemo(() => {
    const now = new Date();
    const to = new Date();
    let from = new Date();
    let label = '';

    if (period === 'custom') {
      return {
        fromDate: customFrom
          ? new Date(customFrom).toISOString()
          : new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        toDate: customTo
          ? new Date(customTo).toISOString()
          : now.toISOString(),
        label: customFrom && customTo
          ? `${customFrom} → ${customTo}`
          : 'Custom Range',
      };
    }

    switch (period) {
      case 'today':
        from = new Date(now.setHours(0, 0, 0, 0));
        label = 'Today';
        break;
      case 'week':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        label = 'Last 7 Days';
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        label = 'This Month';
        break;
      case '3months':
        from = new Date(now);
        from.setMonth(from.getMonth() - 3);
        label = 'Last 3 Months';
        break;
      case '6months':
        from = new Date(now);
        from.setMonth(from.getMonth() - 6);
        label = 'Last 6 Months';
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        label = 'This Year';
        break;
    }

    return {
      fromDate: from.toISOString(),
      toDate: to.toISOString(),
      label,
    };
  }, [period, customFrom, customTo]);

  return {
    period,
    setPeriod,
    fromDate,
    toDate,
    label,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
  };
};