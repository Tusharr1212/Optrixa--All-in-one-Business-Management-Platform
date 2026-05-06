export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':     return 'badge-success';
    case 'pending':  return 'badge-warning';
    case 'overdue':  return 'badge-danger';
    case 'cancelled': return 'badge-info';
    default:         return 'badge-info';
  }
};