"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    if (query.where.id) {
                        return yield exports.prisma.user.findUnique({ where: { id: query.where.id } });
                    }
                    if (query.where.email) {
                        return yield exports.prisma.user.findUnique({ where: { email: query.where.email } });
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
        }), findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.user.findMany();
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            return inMemoryUsers;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.user.create({ data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const newUser = Object.assign(Object.assign({ id: `user-${Date.now()}` }, data), { createdAt: new Date(), updatedAt: new Date() });
            inMemoryUsers.push(newUser);
            return newUser;
        }),
        update: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.user.update({ where: { id: query.where.id }, data: query.data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const userIndex = inMemoryUsers.findIndex(user => user.id === query.where.id);
            if (userIndex !== -1) {
                inMemoryUsers[userIndex] = Object.assign(Object.assign(Object.assign({}, inMemoryUsers[userIndex]), query.data), { updatedAt: new Date() });
                return inMemoryUsers[userIndex];
            }
            throw new Error('User not found');
        }),
        delete: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.user.delete({ where: { id: query.where.id } });
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
        })
    }, order: {
        findMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            if (usePrisma) {
                try {
                    return yield exports.prisma.order.findMany({
                        where: query === null || query === void 0 ? void 0 : query.where,
                        orderBy: query === null || query === void 0 ? void 0 : query.orderBy,
                        include: query === null || query === void 0 ? void 0 : query.include,
                    });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            let results = [...inMemoryOrders];
            if ((_a = query === null || query === void 0 ? void 0 : query.where) === null || _a === void 0 ? void 0 : _a.userId) {
                results = results.filter(order => order.userId === query.where.userId);
            }
            if (((_b = query === null || query === void 0 ? void 0 : query.orderBy) === null || _b === void 0 ? void 0 : _b.createdAt) === 'desc') {
                results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
            return results;
        }),
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.order.findUnique({ where: { id: query.where.id } });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            return inMemoryOrders.find(order => order.id === query.where.id) || null;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.order.create({ data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const newOrder = Object.assign(Object.assign({ id: `order-${Date.now()}` }, data), { createdAt: new Date(), updatedAt: new Date() });
            inMemoryOrders.push(newOrder);
            return newOrder;
        }),
        update: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.order.update({ where: { id: query.where.id }, data: query.data });
                }
                catch (error) {
                    console.warn('Prisma error, falling back to in-memory storage:', error);
                    usePrisma = false;
                }
            }
            // Fallback to in-memory
            const orderIndex = inMemoryOrders.findIndex(order => order.id === query.where.id);
            if (orderIndex !== -1) {
                inMemoryOrders[orderIndex] = Object.assign(Object.assign(Object.assign({}, inMemoryOrders[orderIndex]), query.data), { updatedAt: new Date() });
                return inMemoryOrders[orderIndex];
            }
            throw new Error('Order not found');
        }),
        delete: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.order.delete({ where: { id: query.where.id } });
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
        }),
        updateMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (usePrisma) {
                try {
                    return yield exports.prisma.order.updateMany({ where: query.where, data: query.data });
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
                    inMemoryOrders[index] = Object.assign(Object.assign(Object.assign({}, order), query.data), { updatedAt: new Date() });
                    count++;
                }
            });
            return { count };
        })
    },
    // ...implement other entities as needed...
};
