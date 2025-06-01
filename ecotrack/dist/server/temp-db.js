"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempOrderDocument = exports.tempRouteOption = exports.tempLogisticRoute = exports.tempInventoryItem = void 0;
// Временная заглушка для inventoryItem
exports.tempInventoryItem = {
    async findMany() {
        console.warn("InventoryItem table not yet generated - returning empty array");
        return [];
    },
    async findUnique(params) {
        console.warn("InventoryItem table not yet generated - returning null");
        return null;
    },
    async create(params) {
        console.warn("InventoryItem table not yet generated - returning mock data");
        return {
            id: "temp-" + Date.now(),
            ...params.data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    },
    async update(params) {
        console.warn("InventoryItem table not yet generated - returning mock data");
        return {
            id: params.where.id,
            ...params.data,
            updatedAt: new Date()
        };
    }
};
// Временная заглушка для logisticRoute
exports.tempLogisticRoute = {
    async findMany() {
        console.warn("LogisticRoute table not yet generated - returning empty array");
        return [];
    },
    async findUnique(params) {
        console.warn("LogisticRoute table not yet generated - returning null");
        return null;
    },
    async create(params) {
        console.warn("LogisticRoute table not yet generated - returning mock data");
        return {
            id: "temp-" + Date.now(),
            ...params.data,
            createdAt: new Date(),
            updatedAt: new Date(),
            routeOptions: []
        };
    },
    async update(params) {
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
exports.tempRouteOption = {
    async updateMany(params) {
        console.warn("RouteOption table not yet generated - operation skipped");
        return { count: 0 };
    },
    async update(params) {
        console.warn("RouteOption table not yet generated - returning mock data");
        return {
            id: params.where.id,
            ...params.data,
            updatedAt: new Date()
        };
    }
};
// Временная заглушка для orderDocument
exports.tempOrderDocument = {
    async findMany() {
        console.warn("OrderDocument table not yet generated - returning empty array");
        return [];
    },
    async create(params) {
        console.warn("OrderDocument table not yet generated - returning mock data");
        return {
            id: "temp-" + Date.now(),
            ...params.data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
};
