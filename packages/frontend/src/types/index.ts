// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'ADMIN' | 'SUPERADMIN';
  address?: Address;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Address type
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  state?: string;
  country?: string;
  additionalInfo?: string;
}

// Product types
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: Category;
  pricePerDay: number;
  pricePerWeekend: number;
  pricePerWeek: number;
  stock: number;
  realStock: number;
  stockStatus: 'IN_STOCK' | 'ON_DEMAND' | 'DISCONTINUED' | 'SEASONAL';
  leadTimeDays: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  requiresSpecialTransport: boolean;
  mainImageUrl?: string;
  images: string[];
  specifications?: Record<string, any>;
  isActive: boolean;
  featured: boolean;
  tags: string[];
  // Estadísticas de compra y uso (solo admin)
  purchasePrice?: number;
  purchaseDate?: string;
  timesUsed: number;
  createdAt: string;
  updatedAt: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  startDate: string;
  endDate: string;
  eventType?: string;
  eventLocation: Address;
  attendees?: number;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
  deliveryType: 'PICKUP' | 'DELIVERY' | 'SHIPPING';
  deliveryAddress?: Address;
  deliveryTime?: string;
  deliveryNotes?: string;
  paymentTerm: 'FULL_UPFRONT' | 'PARTIAL_UPFRONT' | 'ON_PICKUP';
  subtotal: number;
  taxAmount: number;
  total: number;
  shippingCost: number;
  depositAmount: number;
  depositStatus: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'RELEASED' | 'PARTIALLY_RETAINED';
  status: OrderStatus;
  items: OrderItem[];
  services?: OrderService[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'PENDING'      // Pendiente - Esperando confirmación de pago
  | 'IN_PROGRESS'  // En Proceso - Pago confirmado, preparando pedido
  | 'COMPLETED'    // Completado - Pedido finalizado
  | 'CANCELLED';   // Cancelado

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  pricePerDay: number;
  subtotal: number;
  notes?: string;
}

export interface OrderService {
  id: string;
  orderId: string;
  serviceId: string;
  service?: Service;
  quantity: number;
  price: number;
  suggestedPrice?: number;
  manuallySet: boolean;
  notes?: string;
}

// Service type
export interface Service {
  id: string;
  name: string;
  description?: string;
  priceType: 'FIXED' | 'PER_HOUR' | 'PER_ITEM' | 'PERCENTAGE';
  price: number;
  estimatedHours?: number;
  pricePerItem?: number;
  isActive: boolean;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  servicesCost: number;
  taxAmount: number;
  total: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  search?: string;
  sortBy?: 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Availability types
export interface AvailabilityQuery {
  productId: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface AvailabilityResult {
  productId: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  isAvailable: boolean;
  conflictingOrders: string[];
}

// Pricing types
export interface PricingQuery {
  productId: string;
  startDate: string;
  endDate: string;
}

export interface PricingResult {
  subtotal: number;
  breakdown: PriceBreakdown[];
  appliedRule: 'POR_DIA' | 'FIN_DE_SEMANA' | 'POR_SEMANA' | 'OPTIMIZADO';
  savings?: {
    amount: number;
    percentage: number;
  };
}

export interface PriceBreakdown {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Payment types
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}
