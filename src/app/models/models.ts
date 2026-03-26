export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  displayOrder?: number;
  productCount?: number;
  parentId?: number | null;
  isMainCategory: boolean;
  subCategories?: Category[];
}

export interface Product {
  id: number;
  name: string;
  productCode: string;
  description?: string;
  ingredients?: string;
  usage?: string;
  contraindications?: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  availableQuantity?: number;
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  packaging?: string;
  imageUrl?: string;
  additionalImages?: string[];
  prescriptionRequired: boolean;
  active: boolean;
  featured: boolean;
  category?: Category;
  categoryId?: number;
  categoryName?: string;
  mainCategoryId?: number | null;
  mainCategoryName?: string | null;
  subCategoryId?: number | null;
  subCategoryName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CartItem {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  price: number;
  originalPrice?: number;
  quantity: number;
  subtotal: number;
  stockQuantity: number;
  availableQuantity?: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  shippingFee?: number;
  freeShippingThreshold?: number;
  grandTotal?: number;
}
export type CartResponse = CartSummary;

export interface OrderItem {
  id: number;
  product: Product;
  productId?: number;
  productName: string;
  productCode: string;
  productImage?: string;
  quantity: number;
  price?: number;
  unitPrice: number;
  totalPrice?: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  notes?: string;
  orderDate: string;
  updatedAt?: string;
  orderItems: OrderItem[];
  itemCount?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  enabled: boolean;
  accountLocked: boolean;
  roles: string[];
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  phone?: string;
  address?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  address?: string;
}


export interface CheckoutRequest {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  salesSummary?: DashboardSalesSummary;
  timeSeries?: DashboardTimeSeries;
  revenueSummary?: DashboardRevenueSummary;
  inventoryValue?: number;
}

export interface DashboardSalesSummary {
  recentOrderCount?: number;
  recentRevenue?: number;
  recentAov?: number;
  recentCancellationRate?: number;
  topSellingProducts?: DashboardTopSellingProduct[];
  statusStats?: DashboardStatusStat[];
  insights?: DashboardInsight[];
}

export interface DashboardTimeSeriesRow {
  label: string;
  orderCount: number;
  revenue: number;
}

export interface DashboardTimeSeries {
  daily: DashboardTimeSeriesRow[];
  weekly: DashboardTimeSeriesRow[];
  monthly: DashboardTimeSeriesRow[];
}

export interface DashboardRevenueSummary {
  today?: number;
  thisWeek?: number;
  thisMonth?: number;
}

export interface DashboardTopSellingProduct {
  productId?: number | null;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface DashboardStatusStat {
  status: string;
  count: number;
  share?: number;
}

export interface DashboardInsight {
  tone: 'success' | 'warning' | 'info';
  message: string;
  link?: string;
  linkLabel?: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp?: Date;
}
