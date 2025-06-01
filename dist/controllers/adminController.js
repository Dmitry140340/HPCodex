"use strict";
/**
 * API методы для административной панели HimkaPlastic EcoTrack
 * Управление KPI, ценообразованием, пользователями и системными настройками
 */
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
exports.getSystemStats = exports.updateSystemSettings = exports.getSystemSettings = exports.updateUserRole = exports.getAllUsers = exports.updatePricingRule = exports.updateKPITarget = exports.getTariffSettings = exports.getPricingRules = exports.getAdminAnalytics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Получение административной аналитики
const getAdminAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Подсчёт пользователей
        const totalUsers = yield prisma.user.count();
        // Активные заказы
        const activeOrders = yield prisma.order.count({
            where: {
                status: {
                    in: ['pending', 'processing', 'delivery']
                }
            }
        });
        // Выручка за текущий месяц
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = yield prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: currentMonth
                },
                status: 'completed'
            },
            _sum: {
                price: true
            }
        });
        // Данные по месяцам за последний год
        const revenueByMonth = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const monthData = yield prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    },
                    status: 'completed'
                },
                _sum: {
                    price: true
                },
                _count: true
            });
            revenueByMonth.push({
                month: startOfMonth.toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'short'
                }),
                revenue: monthData._sum.price || 0,
                orders: monthData._count || 0
            });
        }
        // Распределение пользователей по ролям
        const userActivity = yield prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true
            }
        });
        const formattedUserActivity = userActivity.map(item => ({
            role: item.role,
            count: item._count.role
        }));
        // Фиктивные KPI (в реальном проекте будут храниться в БД)
        const kpiTargets = [
            {
                id: '1',
                name: 'Месячная выручка',
                target: 500000,
                current: monthlyRevenue._sum.price || 0,
                unit: '₽',
                period: 'monthly',
                category: 'financial'
            },
            {
                id: '2',
                name: 'Количество новых клиентов',
                target: 50,
                current: yield prisma.user.count({
                    where: {
                        createdAt: {
                            gte: currentMonth
                        },
                        role: 'client'
                    }
                }),
                unit: 'человек',
                period: 'monthly',
                category: 'operational'
            },
            {
                id: '3',
                name: 'Объём переработки',
                target: 10000,
                current: yield prisma.order.aggregate({
                    where: {
                        createdAt: {
                            gte: currentMonth
                        },
                        status: 'completed'
                    },
                    _sum: {
                        volume: true
                    }
                }).then(result => result._sum.volume || 0),
                unit: 'кг',
                period: 'monthly',
                category: 'environmental'
            },
            {
                id: '4',
                name: 'Экономия CO₂',
                target: 5000,
                current: yield prisma.order.aggregate({
                    where: {
                        createdAt: {
                            gte: currentMonth
                        },
                        status: 'completed'
                    },
                    _sum: {
                        volume: true
                    }
                }).then(result => (result._sum.volume || 0) * 2.1), // Приблизительная формула
                unit: 'кг CO₂',
                period: 'monthly',
                category: 'environmental'
            }
        ];
        // Фиктивная нагрузка системы (в реальном проекте - мониторинг)
        const systemLoad = Math.floor(Math.random() * 30) + 40; // 40-70%
        const analytics = {
            totalUsers,
            activeOrders,
            monthlyRevenue: monthlyRevenue._sum.price || 0,
            systemLoad,
            kpiTargets,
            revenueByMonth,
            userActivity: formattedUserActivity
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Ошибка получения административной аналитики:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.getAdminAnalytics = getAdminAnalytics;
// Получение правил ценообразования
const getPricingRules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // В реальном проекте это будет отдельная таблица в БД
        // Пока возвращаем фиктивные данные
        const pricingRules = [
            {
                id: '1',
                materialType: 'PET',
                basePrice: 45.0,
                currency: 'RUB',
                minVolume: 10,
                maxVolume: 1000,
                active: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: '2',
                materialType: 'HDPE',
                basePrice: 38.0,
                currency: 'RUB',
                minVolume: 10,
                maxVolume: 1000,
                active: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: '3',
                materialType: 'PVC',
                basePrice: 42.0,
                currency: 'RUB',
                minVolume: 10,
                maxVolume: 1000,
                active: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: '4',
                materialType: 'LDPE',
                basePrice: 35.0,
                currency: 'RUB',
                minVolume: 10,
                maxVolume: 1000,
                active: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: '5',
                materialType: 'PP',
                basePrice: 40.0,
                currency: 'RUB',
                minVolume: 10,
                maxVolume: 1000,
                active: true,
                lastUpdated: new Date().toISOString()
            },
            {
                id: '6',
                materialType: 'PS',
                basePrice: 32.0,
                currency: 'RUB',
                minVolume: 10,
                maxVolume: 1000,
                active: true,
                lastUpdated: new Date().toISOString()
            }
        ];
        res.json(pricingRules);
    }
    catch (error) {
        console.error('Ошибка получения правил ценообразования:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.getPricingRules = getPricingRules;
// Получение тарифных настроек
const getTariffSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tariffSettings = [
            {
                id: '1',
                name: 'Стандартный тариф',
                logisticsCostPerKm: 70, // Как указано в ТЗ
                transactionFee: 3.5,
                managementFee: 2.0,
                currency: 'RUB',
                active: true
            },
            {
                id: '2',
                name: 'Премиум тариф',
                logisticsCostPerKm: 85,
                transactionFee: 2.5,
                managementFee: 1.5,
                currency: 'RUB',
                active: false
            }
        ];
        res.json(tariffSettings);
    }
    catch (error) {
        console.error('Ошибка получения тарифных настроек:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.getTariffSettings = getTariffSettings;
// Обновление KPI цели
const updateKPITarget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, target, name, unit, period, category } = req.body;
        // В реальном проекте здесь будет обновление в БД
        // Пока просто возвращаем успех
        console.log(`Обновление KPI ${id}:`, { target, name, unit, period, category });
        res.json({
            success: true,
            message: 'KPI цель обновлена',
            data: { id, target, name, unit, period, category }
        });
    }
    catch (error) {
        console.error('Ошибка обновления KPI цели:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.updateKPITarget = updateKPITarget;
// Обновление правила ценообразования
const updatePricingRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, materialType, basePrice, minVolume, maxVolume, active } = req.body;
        // В реальном проекте здесь будет обновление в БД
        console.log(`Обновление правила ценообразования ${id}:`, {
            materialType, basePrice, minVolume, maxVolume, active
        });
        res.json({
            success: true,
            message: 'Правило ценообразования обновлено',
            data: { id, materialType, basePrice, minVolume, maxVolume, active }
        });
    }
    catch (error) {
        console.error('Ошибка обновления правила ценообразования:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.updatePricingRule = updatePricingRule;
// Получение всех пользователей
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({ select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                // Не возвращаем пароль для безопасности
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Добавляем фиктивное поле active (в реальном проекте будет в БД)
        const usersWithStatus = users.map(user => (Object.assign(Object.assign({}, user), { active: true // Можно рандомизировать или получать из БД
         })));
        res.json(usersWithStatus);
    }
    catch (error) {
        console.error('Ошибка получения списка пользователей:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.getAllUsers = getAllUsers;
// Обновление роли пользователя
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        // Валидация роли
        const validRoles = ['client', 'manager', 'logistic', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Недопустимая роль' });
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { role }, select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        res.json({
            success: true,
            message: 'Роль пользователя обновлена',
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Ошибка обновления роли пользователя:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.updateUserRole = updateUserRole;
// Получение системных настроек
const getSystemSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // В реальном проекте настройки будут храниться в БД
        const settings = {
            notifications: {
                email: true,
                sms: true,
                push: true
            },
            security: {
                sessionTimeout: 60,
                maxLoginAttempts: 5,
                twoFactorAuth: false
            },
            system: {
                maxFileSize: 10,
                updateInterval: 30,
                backupFrequency: 'daily'
            }
        };
        res.json(settings);
    }
    catch (error) {
        console.error('Ошибка получения системных настроек:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.getSystemSettings = getSystemSettings;
// Обновление системных настроек
const updateSystemSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, settings } = req.body;
        // Валидация категории
        const validCategories = ['notifications', 'security', 'system'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Недопустимая категория настроек' });
        }
        // В реальном проекте здесь будет сохранение в БД
        console.log(`Обновление настроек ${category}:`, settings);
        res.json({
            success: true,
            message: 'Настройки обновлены',
            data: { category, settings }
        });
    }
    catch (error) {
        console.error('Ошибка обновления системных настроек:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.updateSystemSettings = updateSystemSettings;
// Получение статистики использования системы
const getSystemStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Статистика за последние 24 часа
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        const stats = {
            activeUsers: yield prisma.user.count({
                where: {
                // В реальном проекте можно отслеживать lastActivity
                }
            }),
            newOrders: yield prisma.order.count({
                where: {
                    createdAt: {
                        gte: last24Hours
                    }
                }
            }),
            totalRevenue: yield prisma.order.aggregate({
                where: {
                    status: 'completed'
                }, _sum: {
                    price: true
                }
            }),
            systemLoad: {
                cpu: Math.floor(Math.random() * 30) + 40,
                memory: Math.floor(Math.random() * 25) + 45,
                disk: Math.floor(Math.random() * 20) + 30
            }
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Ошибка получения статистики системы:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
exports.getSystemStats = getSystemStats;
