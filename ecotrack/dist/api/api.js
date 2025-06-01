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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = exports.signOut = exports.signIn = void 0;
exports.getUsersByRole = getUsersByRole;
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
exports.getAdvancedAnalytics = getAdvancedAnalytics;
exports.getAllOrders = getAllOrders;
exports.getMonthlyFinancialReport = getMonthlyFinancialReport;
exports.getYearlyFinancialReports = getYearlyFinancialReports;
exports.updatePaymentStatus = updatePaymentStatus;
exports.sendNotification = sendNotification;
exports.sendNotificationFromTemplate = sendNotificationFromTemplate;
exports.sendBulkNotifications = sendBulkNotifications;
exports.getUserNotificationSettings = getUserNotificationSettings;
exports.updateNotificationPreferences = updateNotificationPreferences;
exports.connectTelegram = connectTelegram;
exports.subscribeWebPush = subscribeWebPush;
exports.unsubscribeWebPush = unsubscribeWebPush;
exports.verifyNotificationEmail = verifyNotificationEmail;
exports.verifyNotificationPhone = verifyNotificationPhone;
exports.getNotificationHistory = getNotificationHistory;
exports.getNotificationStats = getNotificationStats;
exports.unsubscribeByToken = unsubscribeByToken;
exports.getAllCustomers = getAllCustomers;
exports.getInventoryItems = getInventoryItems;
exports.updateInventoryItem = updateInventoryItem;
exports.createInventoryItem = createInventoryItem;
exports.checkInventoryAvailability = checkInventoryAvailability;
exports.reserveMaterial = reserveMaterial;
exports.getLogisticRoutes = getLogisticRoutes;
exports.createLogisticRoute = createLogisticRoute;
exports.selectRoute = selectRoute;
exports.createAutomaticLogisticRoutes = createAutomaticLogisticRoutes;
exports.generateOrderDocumentation = generateOrderDocumentation;
exports.getOrderDocuments = getOrderDocuments;
const db_1 = require("../server/db");
const actions_1 = require("../server/actions");
const yandexMaps_1 = require("../utils/yandexMaps");
const enhancedNotifications_1 = require("../utils/enhancedNotifications");
const notificationPreferencesService_1 = require("../services/notificationPreferencesService");
const analyticsService_1 = require("../services/analyticsService");
// Authentication handlers
var actions_2 = require("../server/actions");
Object.defineProperty(exports, "signIn", { enumerable: true, get: function () { return actions_2.signIn; } });
Object.defineProperty(exports, "signOut", { enumerable: true, get: function () { return actions_2.signOut; } });
Object.defineProperty(exports, "signUp", { enumerable: true, get: function () { return actions_2.signUp; } });
// Helper function to get users by role
async function getUsersByRole(role) {
    // В текущей системе роль определяется по email домену в actions.ts
    // Получаем всех пользователей и фильтруем по email
    const allUsers = await db_1.db.user.findMany();
    return allUsers.filter(user => {
        let userRole = 'client';
        if (user.isAdmin || user.email.endsWith('@admin.com') || user.email === 'admin@himkaplastic.ru') {
            userRole = 'admin';
        }
        else if (user.email.endsWith('@manager.com')) {
            userRole = 'manager';
        }
        else if (user.email.endsWith('@logistic.com')) {
            userRole = 'logistic';
        }
        return userRole === role;
    }).map(user => prismaUserToUser(user));
}
// User Management
function prismaUserToUser(user) {
    return {
        ...user,
        role: user.role ?? undefined,
        companyName: user.companyName ?? undefined,
        inn: user.inn ?? undefined,
        kpp: user.kpp ?? undefined,
        billingAddress: user.billingAddress ?? undefined,
        dashboardSettings: user.dashboardSettings ?? undefined,
    };
}
async function getCurrentUser(authContext) {
    // Use provided auth context or fall back to getAuth()
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return prismaUserToUser(user);
}
async function updateUserProfile(data, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    const user = await db_1.db.user.update({
        where: { id: auth.userId },
        data,
    });
    return prismaUserToUser(user);
}
// Market Rates
// TODO: Реализовать через Prisma или убрать, если не используется
async function getMarketRates() {
    // return db.marketRate.findMany();
    return [];
}
async function updateMarketRate(input) {
    // TODO: Реализовать через Prisma
    throw new Error('Not implemented');
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
async function getDistanceFromAddress(address) {
    try {
        // Используем адрес завода ООО Химка пластик как точку отсчета
        const distance = await (0, yandexMaps_1.calculateDistance)(yandexMaps_1.HIMKA_PLASTIC_ADDRESS, address);
        return distance ?? 0; // Возвращаем 0, если undefined
    }
    catch (error) {
        console.error("Failed to calculate distance using Yandex Maps:", error);
        // Fallback to our previous implementation
        return fallbackCalculateDistance(address);
    }
}
// Fallback function for distance calculation
async function fallbackCalculateDistance(address) {
    // In a production app, this would use a maps API (Google Maps, Yandex Maps)
    // For now, we'll simulate distances based on regions
    let region;
    try {
        region = await (0, yandexMaps_1.getRegionFromAddress)(address);
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
async function calculateOrderPrice(orderData) {
    // Получаем актуальную рыночную цену с биржи вторсырья
    const { recycleApi } = await Promise.resolve().then(() => __importStar(require('../utils/recycleApi')));
    const materialPrice = await recycleApi.getMaterialPrice(orderData.materialType);
    console.log(`💰 Расчет цены для ${orderData.materialType}:`, {
        volume: orderData.volume,
        materialPrice: materialPrice,
        address: orderData.pickupAddress
    });
    // Get distance based on pickup address using Yandex Maps API
    const distance = orderData.distance || await getDistanceFromAddress(orderData.pickupAddress);
    // Гарантируем неотрицательные значения
    const safeVolume = Math.max(0, orderData.volume);
    const safeDistance = Math.max(0, distance);
    // Константы для расчета согласно ТЗ
    const LOGISTICS_COST_PER_KM = 70; // Ld = 70 рублей (константа)
    const customsDuty = 200; // Tc - таможенные пошлины
    const environmentalTaxRate = 0.5; // Me - экологический налог
    const region = await (0, yandexMaps_1.getRegionFromAddress)(orderData.pickupAddress);
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
}
async function createOrder(orderData, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    // Check inventory availability before proceeding
    const isAvailable = await checkInventoryAvailability(orderData.materialType, orderData.volume);
    if (!isAvailable) {
        throw new Error(`Insufficient inventory for ${orderData.materialType}. Required: ${orderData.volume} kg`);
    }
    // Calculate price and environmental impact
    const priceCalculation = await calculateOrderPrice(orderData);
    // ВАЖНО: явно указываем все обязательные поля для Prisma
    const order = await db_1.db.order.create({
        userId: auth.userId,
        materialType: orderData.materialType,
        volume: orderData.volume,
        pickupAddress: orderData.pickupAddress,
        price: priceCalculation.totalPrice,
        status: "pending",
        paymentStatus: "unpaid",
        environmentalImpact: priceCalculation.environmentalImpact,
    });
    // Reserve material in inventory after order creation
    try {
        await reserveMaterial({
            materialType: orderData.materialType,
            quantity: orderData.volume,
            orderId: order.id
        });
    }
    catch (error) {
        // If reservation fails, delete the order and re-throw error
        await db_1.db.order.delete({ where: { id: order.id } });
        throw new Error(`Failed to reserve materials: ${error.message}`);
    }
    // Получаем данные пользователя для отправки уведомлений
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId }
    });
    if (user?.email) {
        // Отправляем уведомления через новую расширенную систему
        const { enhancedNotificationService } = await Promise.resolve().then(() => __importStar(require('../utils/enhancedNotifications')));
        try { // Отправляем уведомление о создании заказа через шаблон
            await enhancedNotificationService.sendNotificationFromTemplate('order-created', auth.userId, {
                userName: user.name || 'Уважаемый клиент',
                orderId: order.id,
                orderAmount: priceCalculation.totalPrice.toFixed(2)
            }, {
                userEmail: user.email,
                userPhone: undefined, // Phone field not available in current schema
                orderId: order.id,
                priority: 'medium'
            });
            // Отправляем детальное уведомление о начале обработки заказа
            await enhancedNotificationService.sendNotificationFromTemplate('order-processing-started', auth.userId, {
                orderId: order.id,
                materialType: orderData.materialType,
                volume: orderData.volume.toString(),
                pickupAddress: orderData.pickupAddress,
                orderAmount: priceCalculation.totalPrice.toFixed(2),
                environmentalImpact: priceCalculation.environmentalImpact.toFixed(2),
                trackingUrl: `${process.env.FRONTEND_URL}/dashboard?tab=orders&order=${order.id}`
            }, {
                userEmail: user.email,
                userPhone: undefined, // Phone field not available in current schema
                orderId: order.id,
                priority: 'medium'
            });
            console.log(`✅ Уведомления о создании заказа ${order.id} отправлены пользователю ${user.email}`);
        }
        catch (error) {
            console.error('❌ Ошибка отправки уведомлений о создании заказа:', error);
            // Не прерываем создание заказа из-за ошибки уведомлений
        }
    }
    // Fallback старая система (для обратной совместимости)
    try {
        await (0, actions_1.sendEmail)({
            to: user?.email || "customer@example.com",
            subject: `Подтверждение заказа №${order.id}`,
            html: `
        <h1>Ваш заказ принят в обработку</h1>
        <p>Спасибо за ваш заказ. Мы получили запрос на ${orderData.volume} кг ${orderData.materialType}.</p>
        <p>Общая стоимость: ₽${priceCalculation.totalPrice.toFixed(2)}</p>
        <p>Экологический эффект: ${priceCalculation.environmentalImpact.toFixed(2)} кг CO₂ сэкономлено</p>
      `,
        });
    }
    catch (error) {
        console.error('❌ Ошибка отправки fallback email:', error);
    }
    // Автоматически создаем логистические маршруты для нового заказа
    await createAutomaticLogisticRoutes(order.id, orderData.pickupAddress);
    return order;
}
async function getUserOrders(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    const orders = await db_1.db.order.findMany({
        where: { userId: auth.userId }
    });
    return orders;
}
async function getOrderById(input, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const order = await db_1.db.order.findUnique({
        where: { id: input.id },
    });
    if (!order)
        throw new Error("Order not found");
    if (order.userId !== auth.userId) {
        // Check if user is admin
        const user = await db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!user?.isAdmin)
            throw new Error("Not authorized");
    }
    return order;
}
async function updateOrderStatus(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    // Verify admin status
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin)
        throw new Error("Not authorized");
    const order = await db_1.db.order.update({
        where: { id: input.id },
        data: { status: input.status },
    });
    // Получаем данные клиента для отправки уведомлений
    const customer = await db_1.db.user.findUnique({
        where: { id: order.userId }
    });
    if (customer?.email) {
        try {
            // Отправляем уведомления через новую расширенную систему
            const { enhancedNotificationService } = await Promise.resolve().then(() => __importStar(require('../utils/enhancedNotifications')));
            // Определяем подходящий шаблон в зависимости от статуса
            let templateId = 'order-status-changed';
            let variables = {
                orderId: order.id,
                newStatus: input.status
            };
            // Используем специализированные шаблоны для определенных статусов
            switch (input.status) {
                case 'processing':
                    templateId = 'order-pickup-scheduled';
                    variables = {
                        orderId: order.id,
                        materialType: order.materialType,
                        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
                        pickupTime: '10:00-18:00'
                    };
                    break;
                case 'delivery':
                case 'in-transit':
                    templateId = 'order-in-transit';
                    variables = {
                        orderId: order.id,
                        pickupAddress: order.pickupAddress,
                        etaTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('ru-RU')
                    };
                    break;
                case 'completed':
                    templateId = 'order-processing-completed';
                    variables = {
                        orderId: order.id,
                        volume: order.volume.toString(),
                        materialType: order.materialType,
                        recycledAmount: (order.volume * 0.85).toFixed(2), // 85% выход
                        environmentalImpact: order.environmentalImpact.toFixed(2),
                        finalAmount: order.price.toFixed(2),
                        paymentStatus: order.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидает оплаты',
                        documentsUrl: `${process.env.FRONTEND_URL}/dashboard?tab=orders&order=${order.id}&documents=true`
                    };
                    break;
                case 'cancelled':
                    templateId = 'order-cancelled';
                    variables = {
                        orderId: order.id,
                        cancellationReason: 'По техническим причинам'
                    };
                    break;
            } // Отправляем уведомление через шаблон
            await enhancedNotificationService.sendNotificationFromTemplate(templateId, order.userId, variables, {
                userEmail: customer.email,
                userPhone: undefined, // Phone field not available in current schema
                orderId: order.id,
                priority: input.status === 'cancelled' ? 'high' : 'medium'
            });
            console.log(`✅ Уведомление об изменении статуса заказа ${order.id} отправлено через шаблон ${templateId}`);
        }
        catch (error) {
            console.error('❌ Ошибка отправки уведомлений через новую систему:', error);
        }
        // Fallback старая система для обратной совместимости
        try {
            const { notificationService } = await Promise.resolve().then(() => __importStar(require('../utils/notifications')));
            await notificationService.sendOrderStatusNotification(order.id, input.status, customer.email, undefined // Phone field not available
            );
        }
        catch (error) {
            console.error('❌ Ошибка отправки уведомлений через старую систему:', error);
        }
        // Дублируем старую систему email для совместимости
        try {
            await (0, actions_1.sendEmail)({
                to: customer.email,
                subject: `Обновление статуса заказа №${order.id}`,
                html: `
          <h1>Обновление статуса заказа</h1>
          <p>Уважаемый ${customer.name || 'клиент'}!</p>
          <p>Статус вашего заказа был обновлен.</p>
          
          <h2>Детали заказа</h2>
          <ul>
            <li><strong>ID заказа:</strong> ${order.id}</li>
            <li><strong>Новый статус:</strong> ${input.status}</li>
            <li><strong>Материал:</strong> ${order.materialType}</li>
            <li><strong>Объём:</strong> ${order.volume} кг</li>
            <li><strong>Стоимость:</strong> ₽${order.price.toFixed(2)}</li>
          </ul>
          
          <p>Вы можете просмотреть подробную информацию в <a href="${process.env.FRONTEND_URL}/dashboard?tab=orders">личном кабинете</a>.</p>
          
          <p>Спасибо за выбор EcoTrack!</p>
        `,
            });
        }
        catch (error) {
            console.error("❌ Ошибка отправки fallback email:", error);
        }
    }
    console.log(`✅ Статус заказа ${order.id} обновлён на "${input.status}"`);
    return order;
}
// Analytics
async function getUserAnalytics(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    const orders = await db_1.db.order.findMany({
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
}
// Advanced Analytics
async function getAdvancedAnalytics(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    try {
        // Получаем расширенную аналитику из сервиса
        const analytics = await analyticsService_1.analyticsService.getAdvancedAnalytics(auth);
        return analytics;
    }
    catch (error) {
        console.error('Ошибка при получении расширенной аналитики:', error);
        // Возвращаем заглушку в случае ошибки
        return {
            userId: auth.userId,
            kpiData: {
                totalExpenses: 0,
                totalSavings: 0,
                totalVolume: 0,
                qualityScore: 0,
                co2Reduction: 0,
                avgDeliveryTime: 0
            },
            procurementData: [],
            materialAnalysis: [],
            costSavingsData: [],
            qualityData: [],
            ecoImpactData: [],
            supplierData: [],
            demandForecast: [],
            generatedAt: new Date()
        };
    }
}
// Admin functions
async function getAllOrders(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    // Verify admin status
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin)
        throw new Error("Not authorized");
    return await db_1.db.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true },
    });
}
// Financial Reports
async function getMonthlyFinancialReport(params, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    // Get all orders for the specified month
    const startDate = new Date(params.year, params.month - 1, 1);
    const endDate = new Date(params.year, params.month, 0, 23, 59, 59);
    const orders = await db_1.db.order.findMany({
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
}
async function getYearlyFinancialReports(params, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    // Get all orders for the specified year
    const startDate = new Date(params.year, 0, 1);
    const endDate = new Date(params.year, 11, 31, 23, 59, 59);
    const orders = await db_1.db.order.findMany({
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
}
async function updatePaymentStatus(paymentData, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    // Verify order belongs to user
    const order = await db_1.db.order.findUnique({
        where: { id: paymentData.orderId },
    });
    if (!order || order.userId !== auth.userId) {
        throw new Error("Order not found or access denied");
    }
    // Update payment status
    const updatedOrder = await db_1.db.order.update({
        where: { id: paymentData.orderId },
        data: { paymentStatus: paymentData.status },
    });
    // If payment is marked as paid, send receipt
    if (paymentData.status === "paid") {
        await (0, actions_1.sendEmail)({
            to: "customer@example.com", // In real app, would be user's email
            subject: `Receipt for Order #${order.id}`,
            html: `
        <h1>Payment Received</h1>
        <p>Thank you for your payment of ₽${order.price.toFixed(2)} for order #${order.id}.</p>
      `,
        });
    }
    return updatedOrder;
}
// Notification Management
/**
 * Отправка уведомления
 */
async function sendNotification(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    // Проверяем права администратора для системных уведомлений
    if (input.category === 'system' || input.category === 'marketing') {
        const user = await db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!user?.isAdmin)
            throw new Error("Not authorized");
    }
    // Получаем контактную информацию пользователя
    const contactInfo = await notificationPreferencesService_1.notificationPreferencesService.getUserContactInfo(input.userId);
    const notificationResult = await enhancedNotifications_1.enhancedNotificationService.queueNotification({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        scheduledFor: input.scheduledFor
    });
    return { notificationId: notificationResult.notificationId };
}
/**
 * Отправка уведомления по шаблону
 */
async function sendNotificationFromTemplate(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const result = await enhancedNotifications_1.enhancedNotificationService.sendNotificationFromTemplate(input.templateId, input.userId, input.variables);
    return { notificationId: result.notificationId };
}
/**
 * Массовая отправка уведомлений
 */
async function sendBulkNotifications(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    // Проверяем права администратора
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin)
        throw new Error("Not authorized");
    const result = await enhancedNotifications_1.enhancedNotificationService.sendBulkNotifications(input.userIds, input.templateId, input.variables);
    return { notificationIds: result.notificationIds };
}
/**
 * Получение настроек уведомлений пользователя
 */
async function getUserNotificationSettings() {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const settings = await notificationPreferencesService_1.notificationPreferencesService.getUserSettings(auth.userId);
    return settings;
}
/**
 * Обновление настроек уведомлений
 */
async function updateNotificationPreferences(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    // Convert partial input to proper format with defaults
    const updateData = { ...input };
    if (input.categories) {
        updateData.categories = {
            order: input.categories.order ?? true,
            payment: input.categories.payment ?? true,
            delivery: input.categories.delivery ?? true,
            system: input.categories.system ?? true,
            marketing: input.categories.marketing ?? true,
            analytics: input.categories.analytics ?? true,
        };
    }
    await notificationPreferencesService_1.notificationPreferencesService.updateNotificationPreferences(auth.userId, updateData);
    return { success: true };
}
/**
 * Подключение Telegram
 */
async function connectTelegram(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    await notificationPreferencesService_1.notificationPreferencesService.connectTelegram(auth.userId, input.chatId, input.username);
    return { success: true };
}
/**
 * Подписка на Web Push уведомления
 */
async function subscribeWebPush(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    await notificationPreferencesService_1.notificationPreferencesService.subscribeWebPush(auth.userId, input.subscription);
    return { success: true };
}
/**
 * Отписка от Web Push уведомлений
 */
async function unsubscribeWebPush(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    await notificationPreferencesService_1.notificationPreferencesService.unsubscribeWebPush(auth.userId, input?.endpoint);
    return { success: true };
}
/**
 * Верификация email
 */
async function verifyNotificationEmail(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    await notificationPreferencesService_1.notificationPreferencesService.verifyEmail(auth.userId, input.email);
    return { success: true };
}
/**
 * Верификация телефона
 */
async function verifyNotificationPhone(input) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    await notificationPreferencesService_1.notificationPreferencesService.verifyPhone(auth.userId, input.phoneNumber);
    return { success: true };
}
/**
 * Получение истории уведомлений
 */
async function getNotificationHistory(options) {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const historyOptions = options || {};
    const history = await enhancedNotifications_1.enhancedNotificationService.getNotificationHistory({
        userId: auth.userId,
        ...historyOptions
    });
    return history;
}
/**
 * Получение статистики уведомлений
 */
async function getNotificationStats() {
    const auth = await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const stats = await enhancedNotifications_1.enhancedNotificationService.getNotificationStats(auth.userId);
    return stats;
}
/**
 * Отписка от всех уведомлений по токену
 */
async function unsubscribeByToken(input) {
    const success = await notificationPreferencesService_1.notificationPreferencesService.unsubscribeByToken(input.token);
    return { success };
}
// Get all customers for admin/manager users
async function getAllCustomers(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (!auth.userId) {
        throw new Error("Not authenticated");
    }
    // Verify admin/manager status
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'manager') {
        throw new Error("Not authorized - admin or manager privileges required");
    }
    try {
        // Get all users with their order statistics
        const users = await db_1.db.user.findMany({
            where: {
                isAdmin: false, // Exclude admin users from customer list
            },
            select: {
                id: true,
                email: true,
                name: true,
                companyName: true,
                createdAt: true,
            }
        });
        // Get orders for all users separately
        const allOrders = await db_1.db.order.findMany({
            select: {
                id: true,
                userId: true,
                volume: true,
                price: true,
                createdAt: true,
                status: true,
            }
        });
        // Transform users data to include statistics
        const customers = users.map(user => {
            const orders = allOrders.filter(order => order.userId === user.id);
            const totalOrders = orders.length;
            const totalVolume = orders.reduce((sum, order) => sum + order.volume, 0);
            const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
            const lastOrder = orders.length > 0
                ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                : null;
            return {
                id: user.id,
                name: user.name || user.email,
                email: user.email,
                companyName: user.companyName,
                totalOrders,
                totalVolume: Math.round(totalVolume * 10) / 10,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                lastOrderDate: lastOrder ? lastOrder.createdAt : null,
                registrationDate: user.createdAt,
                status: totalOrders > 0 ? 'active' : 'inactive'
            };
        });
        return customers.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        throw new Error('Failed to fetch customers data');
    }
}
// Warehouse Management API Methods
async function getInventoryItems(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    // Verify warehouse manager or admin role
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'manager') {
        throw new Error("Warehouse access required");
    }
    return await db_1.db.inventoryItem.findMany({
        orderBy: { materialType: 'asc' }
    });
}
async function updateInventoryItem(input, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'manager') {
        throw new Error("Warehouse access required");
    }
    return await db_1.db.inventoryItem.update({
        where: { id: input.id },
        data: {
            ...input,
            lastUpdated: new Date()
        }
    });
}
async function createInventoryItem(input, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'manager') {
        throw new Error("Warehouse access required");
    }
    return await db_1.db.inventoryItem.create({
        data: {
            ...input,
            reservedQuantity: 0,
            lastUpdated: new Date()
        }
    });
}
async function checkInventoryAvailability(materialType, requiredQuantity) {
    const inventory = await db_1.db.inventoryItem.findFirst({
        where: { materialType }
    });
    if (!inventory)
        return false;
    const availableForOrder = inventory.availableQuantity - inventory.reservedQuantity;
    return availableForOrder >= requiredQuantity;
}
async function reserveMaterial(input) {
    const inventory = await db_1.db.inventoryItem.findFirst({
        where: { materialType: input.materialType }
    });
    if (!inventory) {
        throw new Error(`Material ${input.materialType} not found in inventory`);
    }
    const availableForOrder = inventory.availableQuantity - inventory.reservedQuantity;
    if (availableForOrder < input.quantity) {
        throw new Error(`Insufficient inventory. Available: ${availableForOrder}, Required: ${input.quantity}`);
    }
    return await db_1.db.inventoryItem.update({
        where: { id: inventory.id },
        data: {
            reservedQuantity: inventory.reservedQuantity + input.quantity,
            lastUpdated: new Date()
        }
    });
}
// Logistics Route Management API Methods
async function getLogisticRoutes(authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'logistic') {
        throw new Error("Logistics access required");
    }
    return await db_1.db.logisticRoute.findMany({
        include: {
            routeOptions: true
        },
        orderBy: { createdAt: 'desc' }
    });
}
async function createLogisticRoute(input, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'logistic') {
        throw new Error("Logistics access required");
    }
    return await db_1.db.logisticRoute.create({
        data: {
            orderId: input.orderId,
            pickupAddress: input.pickupAddress,
            deliveryAddress: input.deliveryAddress,
            estimatedDistance: input.estimatedDistance,
            status: 'pending',
            assignedLogisticianId: auth.userId,
            createdAt: new Date(),
            routeOptions: {
                create: input.routeOptions.map(option => ({
                    ...option,
                    isSelected: false
                }))
            }
        },
        include: {
            routeOptions: true
        }
    });
}
async function selectRoute(input, authContext) {
    const auth = authContext || await (0, actions_1.getAuth)();
    if (auth.status !== "authenticated")
        throw new Error("Not authenticated");
    const user = await db_1.db.user.findUnique({
        where: { id: auth.userId },
    });
    if (!user?.isAdmin && user?.role !== 'logistic') {
        throw new Error("Logistics access required");
    }
    // Update route status and selected option
    await db_1.db.routeOption.updateMany({
        where: { logisticRouteId: input.routeId },
        data: { isSelected: false }
    });
    await db_1.db.routeOption.update({
        where: { id: input.selectedOptionId },
        data: { isSelected: true }
    });
    const updatedRoute = await db_1.db.logisticRoute.update({
        where: { id: input.routeId },
        data: {
            status: 'accepted',
            selectedAt: new Date()
        },
        include: {
            routeOptions: true
        }
    });
    // Update order status to accepted
    const updatedOrder = await db_1.db.order.update({
        where: { id: updatedRoute.orderId },
        data: { status: 'accepted' }
    });
    // Получаем клиента для отправки уведомлений
    const customer = await db_1.db.user.findUnique({
        where: { id: updatedOrder.userId }
    });
    // Отправляем уведомление клиенту о том, что логист выбрал маршрут
    if (customer) {
        try {
            // Получаем выбранный вариант маршрута
            const selectedOption = updatedRoute.routeOptions.find(opt => opt.isSelected);
            await enhancedNotifications_1.enhancedNotificationService.sendNotificationFromTemplate('order-route-selected', customer.id, {
                orderId: updatedOrder.id,
                customerName: customer.name || 'Уважаемый клиент',
                routeName: selectedOption?.name || 'Стандартный маршрут',
                estimatedDeliveryTime: selectedOption?.estimatedTime?.toString() || 'в ближайшее время',
                transportType: selectedOption?.transportType || 'Грузовой транспорт',
                trackingUrl: `${process.env.FRONTEND_URL}/dashboard?tab=orders&order=${updatedOrder.id}`
            }, {
                userEmail: customer.email,
                userPhone: undefined,
                orderId: updatedOrder.id,
                priority: 'high'
            });
            console.log(`✅ Уведомление об обновлении статуса заказа ${updatedOrder.id} отправлено клиенту ${customer.email}`);
        }
        catch (error) {
            console.error(`❌ Ошибка отправки уведомления клиенту ${customer?.email || 'unknown'}:`, error);
        }
    }
    // Generate order documentation
    await generateOrderDocumentation(updatedRoute.orderId);
    return updatedRoute;
}
// Helper function to automatically create logistic routes for new orders
async function createAutomaticLogisticRoutes(orderId, pickupAddress) {
    try {
        // Получаем всех логистов
        const logisticUsers = await getUsersByRole('logistic');
        if (logisticUsers.length === 0) {
            console.warn(`⚠️ Нет доступных логистов для заказа ${orderId}`);
            return;
        }
        // Создаем различные варианты маршрутов для логистов
        const routeOptions = [
            {
                name: 'Экономичный маршрут',
                estimatedCost: 1500,
                estimatedTime: 120, // 2 часа
                transportType: 'Грузовик (до 3 тонн)',
                description: 'Оптимальное соотношение цены и времени доставки'
            },
            {
                name: 'Быстрый маршрут',
                estimatedCost: 2200,
                estimatedTime: 90, // 1.5 часа
                transportType: 'Легкий грузовик',
                description: 'Ускоренная доставка в приоритетном порядке'
            },
            {
                name: 'Стандартный маршрут',
                estimatedCost: 1800,
                estimatedTime: 105, // 1.75 часа
                transportType: 'Грузовик (до 5 тонн)',
                description: 'Стандартные условия доставки'
            }
        ];
        // Создаем логистический маршрут с системным аккаунтом (без аутентификации)
        const logisticRoute = await db_1.db.logisticRoute.create({
            data: {
                orderId,
                pickupAddress,
                deliveryAddress: 'Будет указан клиентом',
                estimatedDistance: 25, // базовое расстояние в км
                status: 'pending',
                assignedLogisticianId: logisticUsers[0].id, // Назначаем первому доступному логисту
                createdAt: new Date(),
                routeOptions: {
                    create: routeOptions.map(option => ({
                        ...option,
                        isSelected: false
                    }))
                }
            },
            include: {
                routeOptions: true
            }
        });
        console.log(`✅ Автоматически создан логистический маршрут ${logisticRoute.id} для заказа ${orderId}`);
        // Уведомляем всех логистов о новом заказе
        for (const logist of logisticUsers) {
            try {
                await enhancedNotifications_1.enhancedNotificationService.sendNotificationFromTemplate('new-order-for-logistics', logist.id, {
                    orderId,
                    pickupAddress,
                    logistName: logist.name || 'Уважаемый логист',
                    routeOptionsCount: routeOptions.length.toString(),
                    dashboardUrl: `${process.env.FRONTEND_URL}/dashboard?tab=logistics&order=${orderId}`
                }, {
                    userEmail: logist.email,
                    userPhone: undefined,
                    orderId,
                    priority: 'high'
                });
                console.log(`✅ Уведомление о новом заказе ${orderId} отправлено логисту ${logist.email}`);
            }
            catch (error) {
                console.error(`❌ Ошибка отправки уведомления логисту ${logist.email}:`, error);
            }
        }
    }
    catch (error) {
        console.error(`❌ Ошибка создания автоматических логистических маршрутов для заказа ${orderId}:`, error);
    }
}
// Document Generation
async function generateOrderDocumentation(orderId) {
    const order = await db_1.db.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            logisticRoutes: {
                include: {
                    routeOptions: {
                        where: { isSelected: true }
                    }
                }
            }
        }
    });
    if (!order) {
        throw new Error("Order not found");
    }
    const selectedRoute = order.logisticRoutes.find(r => r.status === 'accepted');
    const selectedOption = selectedRoute?.routeOptions.find(o => o.isSelected);
    const documentData = {
        orderId: order.id,
        documentType: 'DELIVERY_INVOICE',
        generatedAt: new Date(),
        customerInfo: {
            name: order.user.name,
            email: order.user.email,
            company: order.user.companyName || 'Частное лицо',
            address: order.pickupAddress
        },
        orderDetails: {
            materialType: order.materialType,
            volume: order.volume,
            price: order.price,
            environmentalImpact: order.environmentalImpact
        },
        logisticsInfo: selectedOption ? {
            routeName: selectedOption.name,
            transportType: selectedOption.transportType,
            estimatedCost: selectedOption.estimatedCost,
            estimatedTime: selectedOption.estimatedTime,
            distance: selectedRoute.estimatedDistance
        } : null,
        status: 'generated'
    };
    return await db_1.db.orderDocument.create({
        data: documentData
    });
}
async function getOrderDocuments(orderId) {
    return await db_1.db.orderDocument.findMany({
        where: { orderId },
        orderBy: { generatedAt: 'desc' }
    });
}
