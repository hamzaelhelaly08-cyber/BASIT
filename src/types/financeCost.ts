export type TransactionDirection = 'inflow' | 'outflow' | 'personal' | 'receivable' | 'payable';

export type AccountChannel = 'vodafone_cash' | 'bank' | 'cash' | 'in_app_habe';

export interface FinancialTransaction {
  id: string;
  amount: number;
  direction: TransactionDirection;
  partyName: string; // داخل من عند مين / رايح لمين
  category: string; // التصنيف
  channel: AccountChannel; // فودافون كاش / بنك / نقدي / تطبيق هابي
  commissionPercentage: number;
  baseCost: number;
  netProfit: number; // صافي الربح المعزول
  isOwedToMe: boolean; // ليا
  isOwedByMe: boolean; // عليا
  date: string;
  notes: string;
  storeSource?: string;
  createdAt: string;
}

export interface FoodIngredient {
  id: string;
  name: string;
  unit: 'kg' | 'gram' | 'liter' | 'piece' | 'packet';
  packagePrice: number;
  packageSize: number;
  unitCost: number;
  supplier: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantityNeeded: number;
}

export interface MenuItemRecipe {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  ingredients: RecipeItem[];
  totalFoodCost: number;
  foodCostPercentage: number;
  netProfitPerItem: number;
  notes?: string;
}

export interface StoreIntegration {
  id: string;
  storeName: string;
  webhookUrl: string;
  apiKey: string;
  isActive: boolean;
  autoImportEnabled: boolean;
}
