// Canonical expense types and icons used across Tools and Budget
import {
  Building2,
  CreditCard,
  TrendingDown,
  Shield,
  BarChart,
  PieChart,
  DollarSign
} from '../ui/icons';

// Note: Icons are representative and kept lightweight
export const EXPENSE_TYPE_DEFS = [
  { value: 'housing', label: 'Housing', Icon: Building2 },
  { value: 'transportation', label: 'Transportation', Icon: CreditCard },
  { value: 'food_dining', label: 'Food & Dining', Icon: PieChart },
  { value: 'utilities', label: 'Utilities', Icon: BarChart },
  { value: 'healthcare', label: 'Healthcare', Icon: Shield },
  { value: 'insurance', label: 'Insurance', Icon: Shield },
  { value: 'debt_payments', label: 'Debt Payments', Icon: CreditCard },
  { value: 'personal_care', label: 'Personal Care', Icon: TrendingDown },
  { value: 'business_operating', label: 'Business Operating', Icon: BarChart },
  { value: 'taxes', label: 'Taxes', Icon: DollarSign },
  { value: 'entertainment', label: 'Entertainment', Icon: PieChart },
  { value: 'other', label: 'Other', Icon: TrendingDown }
];

