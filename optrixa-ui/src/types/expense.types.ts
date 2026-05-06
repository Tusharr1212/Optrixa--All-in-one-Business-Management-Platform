export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  categoryName: string;
  categoryId: number;
  receiptUrl?: string;
  expenseDate: string;
  createdAt: string;
}

export interface CreateExpenseDto {
  title: string;
  description?: string;
  categoryId: number;
  amount: number;
  receiptUrl?: string;
  expenseDate: string;
}

export interface UpdateExpenseDto extends CreateExpenseDto {
  id: number;
}