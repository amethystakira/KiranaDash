export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  salesCount: number; // For top selling logic
}

export interface Transaction {
  id: string;
  timestamp: Date;
  totalAmount: number;
  items: { productId: string; quantity: number; name: string; price: number }[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  timestamp: Date;
  category: 'Rent' | 'Utility' | 'Salary' | 'Misc';
}

export interface DailyStats {
  date: string; // ISO date string YYYY-MM-DD
  sales: number;
  transactions: number;
  customers: number;
}

export interface ForecastData {
  day: string;
  predictedSales: number;
  predictedProfit: number; // Added profit prediction
  confidence: number; // 0-100
}

export interface StockAlert {
  productName: string;
  daysRemaining: number;
  severity: 'low' | 'critical';
}

export type AppView = 'home' | 'trends' | 'forecast' | 'settings';

export interface AppSettings {
  currency: string;
  language: string;
  darkMode: boolean;
  lowDataMode: boolean;
  offlineMode: boolean;
}

export interface BackupData {
  version: number;
  timestamp: string;
  products: Product[];
  history: DailyStats[];
  transactions: Transaction[];
  expenses: Expense[];
  baseVisits: number;
  settings: AppSettings;
}