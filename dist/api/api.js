"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.signOut = exports.signUp = exports.signIn = void 0;
exports.getCurrentUser = getCurrentUser;
exports.updateUserProfile = updateUserProfile;
exports.getMarketRates = getMarketRates;
exports.updateMarketRate = updateMarketRate;
exports.calculateOrderPrice = calculateOrderPrice;
exports.createOrder = createOrder;
exports.getUserOrders = getUserOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.getUserAnalytics = getUserAnalytics;
exports.getAllOrders = getAllOrders;
exports.getMonthlyFinancialReport = getMonthlyFinancialReport;
exports.getYearlyFinancialReports = getYearlyFinancialReports;
exports.updatePaymentStatus = updatePaymentStatus;
const db_1 = require("../server/db");
const actions_1 = require("../server/actions");
const yandexMaps_1 = require("../utils/yandexMaps");
// Authentication handlers
const signIn = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, actions_1.signIn)(email, password);
});
exports.signIn = signIn;
const signUp = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, actions_1.signUp)(userData);
});
exports.signUp = signUp;
const signOut = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, actions_1.signOut)(token);
});
exports.signOut = signOut;
// User Management
function prismaUserToUser(user) {
    var _a, _b, _c, _d, _e, _f;
    return Object.assign(Object.assign({}, user), { role: (_a = user.role) !== null && _a !== void 0 ? _a : undefined, companyName: (_b = user.companyName) !== null && _b !== void 0 ? _b : undefined, inn: (_c = user.inn) !== null && _c !== void 0 ? _c : undefined, kpp: (_d = user.kpp) !== null && _d !== void 0 ? _d : undefined, billingAddress: (_e = user.billingAddress) !== null && _e !== void 0 ? _e : undefined, dashboardSettings: (_f = user.dashboardSettings) !== null && _f !== void 0 ? _f : undefined });
}
function getCurrentUser(authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use provided auth context or fall back to getAuth()
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return prismaUserToUser(user);
    });
}
function updateUserProfile(data, authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const user = yield db_1.db.user.update({
            where: { id: auth.userId },
            data,
        });
        return prismaUserToUser(user);
    });
}
// Market Rates
// TODO: Реализовать через Prisma или убрать, если не используется
function getMarketRates() {
    return __awaiter(this, void 0, void 0, function* () {
        // return db.marketRate.findMany();
        return [];
    });
}
function updateMarketRate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: Реализовать через Prisma
        throw new Error('Not implemented');
    });
}
// Order Management
// Helper function to determine region from address - заменяем на новую функцию из yandexMaps
// function getRegionFromAddress(address: string): string {
//   // In a production app, this would use a geocoding API
//   // For now, we'll do a simple text search
//   const addressLower = address.toLowerCase();
//   if (addressLower.includes("москва") || addressLower.includes("moscow")) {
//     return "Москва";
//   } else if (addressLower.includes("санкт-петербург") || addressLower.includes("saint petersburg") || addressLower.includes("st. petersburg")) {
//     return "Санкт-Петербург";
//   } else if (addressLower.includes("екатеринбург") || addressLower.includes("ekaterinburg")) {
//     return "Екатеринбург";
//   } else if (addressLower.includes("новосибирск") || addressLower.includes("novosibirsk")) {
//     return "Новосибирск";
//   }
//   return "По умолчанию";
// }
// Helper function to calculate distance from address - заменяем на новую функцию
function getDistanceFromAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Используем адрес завода ООО Химка пластик как точку отсчета
            const distance = yield (0, yandexMaps_1.calculateDistance)(yandexMaps_1.HIMKA_PLASTIC_ADDRESS, address);
            return distance !== null && distance !== void 0 ? distance : 0; // Возвращаем 0, если undefined
        }
        catch (error) {
            console.error("Failed to calculate distance using Yandex Maps:", error);
            // Fallback to our previous implementation
            return fallbackCalculateDistance(address);
        }
    });
}
// Fallback function for distance calculation
function fallbackCalculateDistance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        // In a production app, this would use a maps API (Google Maps, Yandex Maps)
        // For now, we'll simulate distances based on regions
        let region;
        try {
            region = yield (0, yandexMaps_1.getRegionFromAddress)(address);
        }
        catch (error) {
            // If getRegionFromAddress fails, use simple text matching
            region = getFallbackRegion(address);
        }
        const addressLower = address.toLowerCase();
        // Проверяем, не является ли это адресом в Химках
        if (addressLower.includes("химки")) {
            // Если адрес в Химках, возвращаем небольшое расстояние (1-10 км)
            return 1 + Math.random() * 9;
        }
        switch (region) {
            case "Москва":
                return 10 + Math.random() * 20; // 10-30 km
            case "Санкт-Петербург":
                return 15 + Math.random() * 25; // 15-40 km
            case "Екатеринбург":
                return 20 + Math.random() * 30; // 20-50 km
            case "Новосибирск":
                return 25 + Math.random() * 35; // 25-60 km
            default:
                return 30 + Math.random() * 50; // 30-80 km
        }
    });
}
// Simple text-based region determination
function getFallbackRegion(address) {
    const addressLower = address.toLowerCase();
    if (addressLower.includes("москва") || addressLower.includes("moscow")) {
        return "Москва";
    }
    else if (addressLower.includes("санкт-петербург") || addressLower.includes("saint petersburg") || addressLower.includes("st. petersburg")) {
        return "Санкт-Петербург";
    }
    else if (addressLower.includes("екатеринбург") || addressLower.includes("ekaterinburg")) {
        return "Екатеринбург";
    }
    else if (addressLower.includes("новосибирск") || addressLower.includes("novosibirsk")) {
        return "Новосибирск";
    }
    return "По умолчанию";
}
function calculateOrderPrice(orderData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Получаем актуальную рыночную цену с биржи вторсырья
        const { recycleApi } = yield Promise.resolve().then(() => __importStar(require('../utils/recycleApi')));
        const materialPrice = yield recycleApi.getMaterialPrice(orderData.materialType);
        console.log(`💰 Расчет цены для ${orderData.materialType}:`, {
            volume: orderData.volume,
            materialPrice: materialPrice,
            address: orderData.pickupAddress
        });
        // Get distance based on pickup address using Yandex Maps API
        const distance = orderData.distance || (yield getDistanceFromAddress(orderData.pickupAddress));
        // Гарантируем неотрицательные значения
        const safeVolume = Math.max(0, orderData.volume);
        const safeDistance = Math.max(0, distance);
        // Константы для расчета согласно ТЗ
        const LOGISTICS_COST_PER_KM = 70; // Ld = 70 рублей (константа)
        const customsDuty = 200; // Tc - таможенные пошлины
        const environmentalTaxRate = 0.5; // Me - экологический налог
        const region = yield (0, yandexMaps_1.getRegionFromAddress)(orderData.pickupAddress);
        const environmentalImpact = safeVolume * 1.5; // 1.5kg CO2 saved per kg recycled
        // Формула по ТЗ: C = (P_m * V) + (L_d * D) + T_c + M_e
        // P_m - средняя рыночная стоимость от API бирж
        // V - объем заказа, введенный пользователем  
        // L_d - 70 рублей константа
        // D - расстояние от API Яндекс.Карт
        const basePrice = safeVolume * materialPrice; // (P_m * V)
        const logisticsCost = LOGISTICS_COST_PER_KM * safeDistance; // (L_d * D)
        const environmentalTax = safeVolume * environmentalTaxRate; // M_e
        let totalPrice = basePrice + logisticsCost + customsDuty + environmentalTax;
        if (totalPrice < 0)
            totalPrice = 0;
        return {
            basePrice,
            logisticsCost,
            customsDuty,
            environmentalTax,
            distance: safeDistance,
            region,
            totalPrice,
            environmentalImpact,
            price: totalPrice,
        };
    });
}
function createOrder(orderData, authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Calculate price and environmental impact
        const priceCalculation = yield calculateOrderPrice(orderData);
        // ВАЖНО: явно указываем все обязательные поля для Prisma
        const order = yield db_1.db.order.create({
            userId: auth.userId,
            materialType: orderData.materialType,
            volume: orderData.volume,
            pickupAddress: orderData.pickupAddress,
            price: priceCalculation.totalPrice,
            status: "pending",
            paymentStatus: "unpaid",
            environmentalImpact: priceCalculation.environmentalImpact,
        });
        // Send confirmation email
        yield (0, actions_1.sendEmail)({
            to: "customer@example.com", // In real app, would be user's email
            subject: `Order Confirmation: #${order.id}`,
            html: `
      <h1>Your order has been received</h1>
      <p>Thank you for your order. We have received your request for ${orderData.volume}kg of ${orderData.materialType}.</p>
      <p>Total price: ₽${priceCalculation.totalPrice.toFixed(2)}</p>
      <p>Environmental impact: ${priceCalculation.environmentalImpact.toFixed(2)}kg CO2 saved</p>
    `,
        });
        return order;
    });
}
function getUserOrders(authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        return orders;
    });
}
function getOrderById(input, authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        const order = yield db_1.db.order.findUnique({
            where: { id: input.id },
        });
        if (!order)
            throw new Error("Order not found");
        if (order.userId !== auth.userId) {
            // Check if user is admin
            const user = yield db_1.db.user.findUnique({
                where: { id: auth.userId },
            });
            if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
                throw new Error("Not authorized");
        }
        return order;
    });
}
function updateOrderStatus(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        // Verify admin status
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
            throw new Error("Not authorized");
        const order = yield db_1.db.order.update({
            where: { id: input.id },
            data: { status: input.status },
        });
        // Получаем данные клиента для отправки уведомлений
        const customer = yield db_1.db.user.findUnique({
            where: { id: order.userId }
        });
        if (customer === null || customer === void 0 ? void 0 : customer.email) {
            // Отправляем уведомления через новую систему
            const { notificationService } = yield Promise.resolve().then(() => __importStar(require('../utils/notifications')));
            yield notificationService.sendOrderStatusNotification(order.id, input.status, customer.email);
            // Дублируем старую систему email для совместимости
            try {
                yield (0, actions_1.sendEmail)({
                    to: customer.email,
                    subject: `Обновление статуса заказа - ${input.status.toUpperCase()}`,
                    text: `
# Обновление статуса заказа

Статус вашего заказа был обновлен.

## Детали заказа
- ID заказа: ${order.id}
- Новый статус: ${order.status.toUpperCase()}
- Материал: ${order.materialType}
- Объём: ${order.volume} кг
- Стоимость: ₽${order.price.toFixed(2)}

Вы можете просмотреть подробную информацию в личном кабинете.

Спасибо за выбор EcoTrack!
        `,
                });
            }
            catch (error) {
                console.error("Ошибка отправки дублирующего email:", error);
            }
        }
        console.log(`✅ Статус заказа ${order.id} обновлён на "${input.status}"`);
        return order;
    });
}
// Analytics
function getUserAnalytics(authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        if (orders.length === 0) {
            return {
                totalOrders: 0,
                totalVolume: 0,
                totalEarnings: 0,
                totalCO2Saved: 0,
                monthlyData: [],
                materialBreakdown: [],
                orderStatusBreakdown: [],
            };
        }
        // Calculate analytics from orders
        const materialStats = {};
        const statusStats = {};
        const monthlyStats = {};
        let totalOrders = 0;
        let totalVolume = 0;
        let totalEarnings = 0;
        let totalCO2Saved = 0;
        orders.forEach(order => {
            totalOrders += 1;
            totalVolume += order.volume;
            totalEarnings += order.price;
            totalCO2Saved += order.environmentalImpact;
            // Group by material type
            if (!materialStats[order.materialType]) {
                materialStats[order.materialType] = 0;
            }
            materialStats[order.materialType] += order.volume;
            // Group by status
            if (!statusStats[order.status]) {
                statusStats[order.status] = 0;
            }
            statusStats[order.status] += 1;
            // Group by month
            const orderDate = new Date(order.createdAt);
            const monthKey = orderDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' });
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { volume: 0, earnings: 0, co2Saved: 0 };
            }
            monthlyStats[monthKey].volume += order.volume;
            monthlyStats[monthKey].earnings += order.price;
            monthlyStats[monthKey].co2Saved += order.environmentalImpact;
        });
        // Convert to frontend format
        const monthlyData = Object.entries(monthlyStats).map(([month, data]) => ({
            month,
            volume: data.volume,
            earnings: data.earnings,
            co2Saved: data.co2Saved,
        }));
        const materialBreakdown = Object.entries(materialStats).map(([material, volume]) => ({
            material,
            volume,
            percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
        }));
        const orderStatusBreakdown = Object.entries(statusStats).map(([status, count]) => ({
            status,
            count,
        }));
        return {
            totalOrders,
            totalVolume,
            totalEarnings,
            totalCO2Saved,
            monthlyData,
            materialBreakdown,
            orderStatusBreakdown,
        };
    });
}
// Admin functions
function getAllOrders(authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        // Verify admin status
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
            throw new Error("Not authorized");
        return yield db_1.db.order.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: true },
        });
    });
}
// Financial Reports
function getMonthlyFinancialReport(params, authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Get all orders for the specified month
        const startDate = new Date(params.year, params.month - 1, 1);
        const endDate = new Date(params.year, params.month, 0, 23, 59, 59);
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        // Фильтруем заказы по дате на стороне JavaScript
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });
        // Calculate totals
        const totalPaid = filteredOrders.reduce((sum, order) => sum + order.price, 0);
        const volume = filteredOrders.reduce((sum, order) => sum + order.volume, 0);
        const monthNames = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        return {
            id: `report-${params.year}-${params.month}`,
            month: params.month,
            year: params.year,
            totalPaid,
            volume,
            monthName: monthNames[params.month - 1],
        };
    });
}
function getYearlyFinancialReports(params, authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Get all orders for the specified year
        const startDate = new Date(params.year, 0, 1);
        const endDate = new Date(params.year, 11, 31, 23, 59, 59);
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        // Фильтруем заказы по дате на стороне JavaScript
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });
        // Group orders by month and calculate totals
        const monthlyReports = {};
        // Initialize all months
        for (let month = 1; month <= 12; month++) {
            monthlyReports[month] = { totalPaid: 0, volume: 0 };
        }
        // Add data from orders
        filteredOrders.forEach((order) => {
            const orderDate = new Date(order.createdAt);
            const month = orderDate.getMonth() + 1; // months are 0-indexed in JS
            monthlyReports[month].totalPaid += order.price;
            monthlyReports[month].volume += order.volume;
        });
        // Convert to array of reports
        const reports = [];
        const monthNames = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        for (let month = 1; month <= 12; month++) {
            const totalPaid = monthlyReports[month].totalPaid;
            const volume = monthlyReports[month].volume;
            reports.push({
                id: `report-${params.year}-${month}`,
                month,
                year: params.year,
                totalPaid,
                volume,
                monthName: monthNames[month - 1],
            });
        }
        return reports;
    });
}
function updatePaymentStatus(paymentData, authContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = authContext || (yield (0, actions_1.getAuth)());
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Verify order belongs to user
        const order = yield db_1.db.order.findUnique({
            where: { id: paymentData.orderId },
        });
        if (!order || order.userId !== auth.userId) {
            throw new Error("Order not found or access denied");
        }
        // Update payment status
        const updatedOrder = yield db_1.db.order.update({
            where: { id: paymentData.orderId },
            data: { paymentStatus: paymentData.status },
        });
        // If payment is marked as paid, send receipt
        if (paymentData.status === "paid") {
            yield (0, actions_1.sendEmail)({
                to: "customer@example.com", // In real app, would be user's email
                subject: `Receipt for Order #${order.id}`,
                html: `
        <h1>Payment Received</h1>
        <p>Thank you for your payment of ₽${order.price.toFixed(2)} for order #${order.id}.</p>
      `,
            });
        }
        return updatedOrder;
    });
}
