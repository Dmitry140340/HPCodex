// Временные обертки для работы с новыми таблицами до генерации Prisma клиента
import { db } from "./db";

// Временная заглушка для inventoryItem
export const tempInventoryItem = {
  async findMany() {
    console.warn("InventoryItem table not yet generated - returning empty array");
    return [];
  },
  async findUnique(params: any) {
    console.warn("InventoryItem table not yet generated - returning null");
    return null;
  },
  async create(params: any) {
    console.warn("InventoryItem table not yet generated - returning mock data");
    return {
      id: "temp-" + Date.now(),
      ...params.data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },
  async update(params: any) {
    console.warn("InventoryItem table not yet generated - returning mock data");
    return {
      id: params.where.id,
      ...params.data,
      updatedAt: new Date()
    };
  }
};

// Временная заглушка для logisticRoute
export const tempLogisticRoute = {
  async findMany() {
    console.warn("LogisticRoute table not yet generated - returning empty array");
    return [];
  },
  async findUnique(params: any) {
    console.warn("LogisticRoute table not yet generated - returning null");
    return null;
  },
  async create(params: any) {
    console.warn("LogisticRoute table not yet generated - returning mock data");
    return {
      id: "temp-" + Date.now(),
      ...params.data,
      createdAt: new Date(),
      updatedAt: new Date(),
      routeOptions: []
    };
  },
  async update(params: any) {
    console.warn("LogisticRoute table not yet generated - returning mock data");
    return {
      id: params.where.id,
      ...params.data,
      updatedAt: new Date(),
      routeOptions: []
    };
  }
};

// Временная заглушка для routeOption
export const tempRouteOption = {
  async updateMany(params: any) {
    console.warn("RouteOption table not yet generated - operation skipped");
    return { count: 0 };
  },
  async update(params: any) {
    console.warn("RouteOption table not yet generated - returning mock data");
    return {
      id: params.where.id,
      ...params.data,
      updatedAt: new Date()
    };
  }
};

// Временная заглушка для orderDocument
export const tempOrderDocument = {
  async findMany() {
    console.warn("OrderDocument table not yet generated - returning empty array");
    return [];
  },
  async create(params: any) {
    console.warn("OrderDocument table not yet generated - returning mock data");
    return {
      id: "temp-" + Date.now(),
      ...params.data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};
