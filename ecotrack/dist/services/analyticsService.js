"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const db_1 = require("../server/db");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// Analytics Service
exports.analyticsService = {
    async generateComprehensiveReport(filters, auth) {
        console.log('📊 Generating comprehensive report:', filters);
        // Simulate report generation
        return {
            reportId: `report_${Date.now()}`,
            generatedAt: new Date(),
            filters,
            data: {
                totalOrders: 150,
                totalRevenue: 450000,
                environmentalImpact: 2250,
                averageOrderValue: 3000
            }
        };
    },
    async exportReport(options) {
        console.log('📤 Exporting report:', options);
        // Simulate export
        return {
            exportId: `export_${Date.now()}`,
            format: options.format,
            downloadUrl: `/api/reports/download/${Date.now()}`,
            createdAt: new Date()
        };
    },
    async getAdvancedAnalytics(auth) {
        console.log('📊 Getting advanced analytics for user:', auth.userId);
        try {
            // Получаем заказы пользователя за последние 12 месяцев
            const startDate = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), 11));
            const endDate = (0, date_fns_1.endOfMonth)(new Date());
            const userOrders = await db_1.db.order.findMany({
                where: {
                    userId: auth.userId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            // Вычисляем основные KPI
            const totalOrders = userOrders.length;
            const totalExpenses = userOrders.reduce((sum, order) => sum + order.price, 0);
            const totalVolume = userOrders.reduce((sum, order) => sum + order.volume, 0);
            const totalEcoImpact = userOrders.reduce((sum, order) => sum + order.environmentalImpact, 0);
            const averageOrderValue = totalOrders > 0 ? totalExpenses / totalOrders : 0;
            // Группируем заказы по месяцам
            const monthlyData = [];
            for (let i = 11; i >= 0; i--) {
                const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
                const monthEnd = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
                const monthOrders = userOrders.filter(order => order.createdAt >= monthStart && order.createdAt <= monthEnd);
                const monthName = (0, date_fns_1.format)(monthStart, 'MMM', { locale: locale_1.ru });
                // Разбиваем по типам материалов
                const materialStats = monthOrders.reduce((acc, order) => {
                    const material = order.materialType.toLowerCase();
                    if (!acc[material])
                        acc[material] = { volume: 0, expenses: 0 };
                    acc[material].volume += order.volume;
                    acc[material].expenses += order.price;
                    return acc;
                }, {});
                monthlyData.push({
                    month: monthName,
                    totalExpenses: monthOrders.reduce((sum, order) => sum + order.price, 0),
                    totalVolume: monthOrders.reduce((sum, order) => sum + order.volume, 0),
                    ordersCount: monthOrders.length,
                    pvc: materialStats.pvc?.volume || 0,
                    pp: materialStats.pp?.volume || 0,
                    pet: materialStats.pet?.volume || 0,
                    pe: materialStats.pe?.volume || 0,
                    materialStats
                });
            } // Анализ по типам материалов
            const materialAnalysis = userOrders.reduce((acc, order) => {
                const material = order.materialType;
                if (!acc[material]) {
                    acc[material] = { volume: 0, expenses: 0, orders: 0, avgPrice: 0 };
                }
                acc[material].volume += order.volume;
                acc[material].expenses += order.price;
                acc[material].orders += 1;
                acc[material].avgPrice = acc[material].expenses / acc[material].volume;
                return acc;
            }, {});
            // Расчет экономии (предполагаем 25% экономии по сравнению с первичным пластиком)
            const estimatedPrimaryCost = totalExpenses * 1.35; // +35% к стоимости вторсырья
            const totalSavings = estimatedPrimaryCost - totalExpenses;
            // Анализ качества (симуляция на основе данных)
            const qualityAnalysis = monthlyData.map(month => ({
                month: month.month,
                A_grade: Math.max(85, Math.min(95, 90 + Math.random() * 5)),
                B_grade: Math.max(5, Math.min(12, 8 + Math.random() * 4)),
                C_grade: Math.max(1, Math.min(5, 2 + Math.random() * 2))
            }));
            // Экологический вклад
            const ecoAnalysis = monthlyData.map(month => ({
                month: month.month,
                co2Reduction: month.totalVolume * 0.005, // 5 кг CO2 на тонну
                wasteUse: month.totalVolume,
                energySaved: month.totalVolume * 0.008 // 8 кВт*ч на тонну
            }));
            return {
                userId: auth.userId,
                kpiData: {
                    totalExpenses: Math.round(totalExpenses),
                    totalSavings: Math.round(totalSavings),
                    totalVolume: Math.round(totalVolume),
                    qualityScore: 90,
                    co2Reduction: Math.round(totalEcoImpact * 0.005),
                    avgDeliveryTime: 2.5
                },
                procurementData: monthlyData, materialAnalysis: Object.entries(materialAnalysis).map(([material, data]) => ({
                    name: material,
                    volume: Math.round(data.volume),
                    expenses: Math.round(data.expenses),
                    orders: data.orders,
                    avgPrice: Math.round(data.avgPrice)
                })),
                costSavingsData: monthlyData.map(month => ({
                    month: month.month,
                    primaryCost: Math.round(month.totalExpenses * 1.35),
                    secondaryCost: Math.round(month.totalExpenses),
                    savings: Math.round(month.totalExpenses * 0.35)
                })),
                qualityData: qualityAnalysis,
                ecoImpactData: ecoAnalysis,
                supplierData: [{
                        region: 'ООО Химка Пластик - Основной поставщик',
                        purchases: Math.round(totalExpenses),
                        quality: 92,
                        deliveryTime: 2.8
                    }],
                demandForecast: this.generateForecast(monthlyData.slice(-3)),
                generatedAt: new Date()
            };
        }
        catch (error) {
            console.error('Ошибка при получении расширенной аналитики:', error);
            // Возвращаем заглушку при ошибке
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
    },
    generateForecast(recentData) {
        if (recentData.length < 2)
            return [];
        const trend = recentData[recentData.length - 1].totalVolume - recentData[0].totalVolume;
        const avgVolume = recentData.reduce((sum, d) => sum + d.totalVolume, 0) / recentData.length;
        return [
            { month: 'Jul', actual: null, predicted: Math.round(avgVolume + trend * 0.3), confidence: 92 },
            { month: 'Aug', actual: null, predicted: Math.round(avgVolume + trend * 0.6), confidence: 89 },
            { month: 'Sep', actual: null, predicted: Math.round(avgVolume + trend * 0.9), confidence: 85 },
        ];
    },
    async getWasteTrends(period) {
        console.log('📈 Getting waste trends for period:', period);
        return {
            period,
            trends: [
                { date: '2024-01-01', plastic: 1200, paper: 800, metal: 300 },
                { date: '2024-01-02', plastic: 1350, paper: 750, metal: 320 },
                { date: '2024-01-03', plastic: 1100, paper: 900, metal: 280 }
            ],
            totalWaste: 5850,
            growth: 12.5
        };
    },
    async getRegionalProfitability() {
        console.log('🗺️ Getting regional profitability data');
        return {
            regions: [
                { name: 'Москва', revenue: 250000, orders: 85, profitability: 18.5 },
                { name: 'СПб', revenue: 180000, orders: 62, profitability: 16.2 },
                { name: 'Екатеринбург', revenue: 120000, orders: 41, profitability: 14.8 }
            ],
            totalRevenue: 550000,
            averageProfitability: 16.5
        };
    },
    async getDemandForecast(months) {
        console.log('🔮 Getting demand forecast for months:', months);
        return {
            forecastPeriod: months,
            predictions: [
                { month: 1, expectedOrders: 180, confidence: 85 },
                { month: 2, expectedOrders: 195, confidence: 82 },
                { month: 3, expectedOrders: 210, confidence: 78 }
            ],
            totalPredictedOrders: months * 195,
            trendDirection: 'up'
        };
    },
    async getRealTimeKPIs() {
        console.log('⚡ Getting real-time KPIs');
        return {
            timestamp: new Date(),
            kpis: {
                activeOrders: 45,
                todayRevenue: 28500,
                processingTime: '2.3 hours',
                customerSatisfaction: 4.6,
                wasteProcessed: '1.2 tons',
                environmentalSaving: '890 kg CO2'
            },
            status: 'healthy'
        };
    },
    async getMaterialDistribution(period) {
        console.log('📊 Getting material distribution for period:', period);
        return {
            period,
            distribution: {
                plastic: { percentage: 65, volume: '2.1 tons', revenue: 185000 },
                paper: { percentage: 25, volume: '0.8 tons', revenue: 45000 },
                metal: { percentage: 10, volume: '0.3 tons', revenue: 35000 }
            },
            totalVolume: '3.2 tons',
            totalRevenue: 265000
        };
    },
    async createKPIAlert(alertData) {
        console.log('🚨 Creating KPI alert:', alertData);
        return {
            alertId: `alert_${Date.now()}`,
            type: alertData.type,
            threshold: alertData.threshold,
            metric: alertData.metric,
            isActive: true,
            createdAt: new Date()
        };
    },
    async getKPIHistory(kpiId, period) {
        console.log('📈 Getting KPI history for:', kpiId, period);
        return {
            kpiId,
            period,
            history: [
                { date: '2024-01-01', value: 85.2, target: 80 },
                { date: '2024-01-02', value: 87.1, target: 80 },
                { date: '2024-01-03', value: 89.5, target: 80 }
            ],
            averageValue: 87.3,
            targetAchievement: 109.1
        };
    }
};
