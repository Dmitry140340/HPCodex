"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.prisma = void 0;
// Заменяем in-memory реализацию db на PrismaClient для работы с PostgreSQL
const client_1 = require("@prisma/client");
// Fallback in-memory storage for development
const inMemoryUsers = [
    {
        id: "user-1",
        email: "test@example.com",
        name: "Тестовый Пользователь",
        password: "password123",
        isAdmin: false,
        role: 'client',
        companyName: "ООО Тест",
        inn: null,
        kpp: null,
        billingAddress: null,
        dashboardSettings: JSON.stringify([
            { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
            { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
            { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "admin-1",
        email: "admin@admin.com",
        name: "Администратор",
        password: "admin123",
        isAdmin: true,
        role: 'admin',
        companyName: "ООО Химка Пластик",
        inn: null,
        kpp: null,
        billingAddress: null,
        dashboardSettings: JSON.stringify([
            { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
            { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
            { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
const inMemoryOrders = [];
exports.prisma = new client_1.PrismaClient();
// Try to use Prisma, fallback to in-memory if fails
let usePrisma = true;
exports.db = {
    user: {
        findUnique: async (query) => {
            if (usePrisma) {
                try {
                    if (query.where.id) {
                        return await exports.prisma.user.findUnique({ where: { id: query.where.id } });
                    }
                    if (query.where.email) {
                        return await exports.prisma.user.findUnique({ where: { email: query.where.email } });
                    }
                    return null;
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            if (query.where.id) {
                return inMemoryUsers.find(user => user.id === query.where.id) || null;
            }
            if (query.where.email) {
                return inMemoryUsers.find(user => user.email === query.where.email) || null;
            }
            return null;
        },
        findMany: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.user.findMany(query);
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Apply filters for in-memory storage
            let users = [...inMemoryUsers];
            if (query?.where) {
                if (query.where.isAdmin !== undefined) {
                    users = users.filter(user => user.isAdmin === query.where.isAdmin);
                }
            }
            if (query?.select) {
                users = users.map(user => {
                    const selected = {};
                    for (const field in query.select) {
                        if (query.select[field] && user.hasOwnProperty(field)) {
                            selected[field] = user[field];
                        }
                    }
                    return selected;
                });
            }
            return users;
        },
        create: async (data) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.user.create({ data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const newUser = {
                id: `user-${Date.now()}`,
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryUsers.push(newUser);
            return newUser;
        },
        update: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.user.update({ where: { id: query.where.id }, data: query.data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const userIndex = inMemoryUsers.findIndex(user => user.id === query.where.id);
            if (userIndex !== -1) {
                inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...query.data, updatedAt: new Date() };
                return inMemoryUsers[userIndex];
            }
            throw new Error('User not found');
        },
        delete: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.user.delete({ where: { id: query.where.id } });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const userIndex = inMemoryUsers.findIndex(user => user.id === query.where.id);
            if (userIndex !== -1) {
                const deletedUser = inMemoryUsers[userIndex];
                inMemoryUsers.splice(userIndex, 1);
                return deletedUser;
            }
            throw new Error('User not found');
        }
    },
    order: {
        findMany: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.order.findMany({
                        where: query?.where,
                        orderBy: query?.orderBy,
                        include: query?.include,
                    });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            let results = [...inMemoryOrders];
            if (query?.where?.userId) {
                results = results.filter(order => order.userId === query.where.userId);
            }
            if (query?.orderBy?.createdAt === 'desc') {
                results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            return results;
        },
        findUnique: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.order.findUnique({ where: { id: query.where.id } });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            return inMemoryOrders.find(order => order.id === query.where.id) || null;
        },
        create: async (data) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.order.create({ data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const newOrder = {
                id: `order-${Date.now()}`,
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryOrders.push(newOrder);
            return newOrder;
        },
        update: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.order.update({ where: { id: query.where.id }, data: query.data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const orderIndex = inMemoryOrders.findIndex(order => order.id === query.where.id);
            if (orderIndex !== -1) {
                inMemoryOrders[orderIndex] = { ...inMemoryOrders[orderIndex], ...query.data, updatedAt: new Date() };
                return inMemoryOrders[orderIndex];
            }
            throw new Error('Order not found');
        },
        delete: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.order.delete({ where: { id: query.where.id } });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const orderIndex = inMemoryOrders.findIndex(order => order.id === query.where.id);
            if (orderIndex !== -1) {
                const deletedOrder = inMemoryOrders[orderIndex];
                inMemoryOrders.splice(orderIndex, 1);
                return deletedOrder;
            }
            throw new Error('Order not found');
        },
        updateMany: async (query) => {
            if (usePrisma) {
                try {
                    return await exports.prisma.order.updateMany({ where: query.where, data: query.data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            let count = 0;
            inMemoryOrders.forEach((order, index) => {
                let matches = true;
                if (query.where.userId && order.userId !== query.where.userId)
                    matches = false;
                if (matches) {
                    inMemoryOrders[index] = { ...order, ...query.data, updatedAt: new Date() };
                    count++;
                }
            });
            return { count };
        }
    },
    // Warehouse Management Models - временные заглушки
    inventoryItem: {
        findMany: async (query) => {
            console.warn("InventoryItem table not yet generated - returning mock data");
            return [
                {
                    id: "inv-1",
                    materialType: "PET",
                    availableQuantity: 1000,
                    reservedQuantity: 50,
                    location: "Склад А-1",
                    minThreshold: 100,
                    maxCapacity: 2000,
                    lastUpdated: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: "inv-2",
                    materialType: "HDPE",
                    availableQuantity: 800,
                    reservedQuantity: 30,
                    location: "Склад А-2",
                    minThreshold: 150,
                    maxCapacity: 1500,
                    lastUpdated: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
        },
        findUnique: async (query) => {
            console.warn("InventoryItem table not yet generated - returning null");
            return null;
        },
        create: async (data) => {
            console.warn("InventoryItem table not yet generated - returning mock data");
            return {
                id: "temp-" + Date.now(),
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        },
        update: async (data) => {
            console.warn("InventoryItem table not yet generated - returning mock data");
            return {
                id: data.where.id,
                ...data.data,
                updatedAt: new Date()
            };
        }
    },
    // Logistics Models - временные заглушки
    logisticRoute: {
        findMany: async (query) => {
            console.warn("LogisticRoute table not yet generated - returning empty array");
            return [];
        },
        findUnique: async (query) => {
            console.warn("LogisticRoute table not yet generated - returning null");
            return null;
        },
        create: async (data) => {
            console.warn("LogisticRoute table not yet generated - returning mock data");
            return {
                id: "temp-route-" + Date.now(),
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date(),
                routeOptions: []
            };
        },
        update: async (data) => {
            console.warn("LogisticRoute table not yet generated - returning mock data");
            return {
                id: data.where.id,
                ...data.data,
                updatedAt: new Date(),
                routeOptions: []
            };
        }
    },
    routeOption: {
        updateMany: async (data) => {
            console.warn("RouteOption table not yet generated - operation skipped");
            return { count: 0 };
        },
        update: async (data) => {
            console.warn("RouteOption table not yet generated - returning mock data");
            return {
                id: data.where.id,
                ...data.data,
                updatedAt: new Date()
            };
        }
    },
    orderDocument: {
        findMany: async (query) => {
            console.warn("OrderDocument table not yet generated - returning empty array");
            return [];
        },
        create: async (data) => {
            console.warn("OrderDocument table not yet generated - returning mock data");
            return {
                id: "temp-doc-" + Date.now(),
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    }
};
