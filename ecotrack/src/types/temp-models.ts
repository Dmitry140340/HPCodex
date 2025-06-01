// Временные типы для новых моделей до генерации Prisma клиента
export interface InventoryItem {
  id: string;
  materialType: string;
  availableQuantity: number;
  reservedQuantity: number;
  location: string;
  lastUpdated: Date;
  minThreshold: number;
  maxCapacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogisticRoute {
  id: string;
  orderId: string;
  fromAddress: string;
  toAddress: string;
  distance: number;
  estimatedTime: number;
  cost: number;
  status: string;
  assignedLogisticianId: string;
  selectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  routeOptions: RouteOption[];
}

export interface RouteOption {
  id: string;
  logisticRouteId: string;
  name: string;
  estimatedCost: number;
  estimatedTime: number;
  transportType: string;
  description?: string;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDocument {
  id: string;
  orderId: string;
  documentType: string;
  customerInfo: any;
  orderDetails: any;
  logisticsInfo?: any;
  status: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
