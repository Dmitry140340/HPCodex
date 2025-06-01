"use strict";
/**
 * API интеграция с биржами вторсырья (Backend)
 * Получение актуальных рыночных цен на пластиковые отходы
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recycleApi = void 0;
const axios_1 = __importDefault(require("axios"));
class RecycleApiClient {
    constructor() {
        this.baseUrl = 'https://api.recycle.com/v1'; // Примерный URL API биржи
        this.apiKey = process.env.RECYCLE_API_KEY;
        this.fallbackRates = {
            'PET': 52.0,
            'HDPE': 48.5,
            'PVC': 35.0,
            'LDPE': 45.0,
            'PP': 50.0,
            'PS': 30.0,
            'OTHER': 25.0
        };
    }
    /**
     * Получение рыночных цен с биржи вторсырья
     */
    getMarketRates() {
        return __awaiter(this, arguments, void 0, function* (region = 'RU') {
            try {
                // Попытка получить данные с реального API
                const response = yield axios_1.default.get(`${this.baseUrl}/market-rates`, {
                    params: { region },
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                if (response.status === 200 && response.data.success) {
                    console.log('✅ Получены актуальные цены с биржи вторсырья');
                    return response.data.data;
                }
            }
            catch (error) {
                console.warn('⚠️ Ошибка получения данных с биржи вторсырья, используем fallback данные:', error);
            }
            // Fallback - возвращаем актуальные цены для тестирования
            return this.getFallbackRates();
        });
    }
    /**
     * Получение цены для конкретного материала
     */
    getMaterialPrice(materialType, region) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rates = yield this.getMarketRates(region);
                const rate = rates.find(r => r.materialType === materialType);
                const price = (rate === null || rate === void 0 ? void 0 : rate.pricePerKg) || this.fallbackRates[materialType] || 40.0;
                console.log(`💰 Цена для ${materialType}: ${price} руб/кг (источник: ${(rate === null || rate === void 0 ? void 0 : rate.source) || 'fallback'})`);
                return price;
            }
            catch (error) {
                console.error('Ошибка получения цены материала:', error);
                return this.fallbackRates[materialType] || 40.0;
            }
        });
    }
    /**
     * Fallback данные для тестирования (актуальные цены на декабрь 2024)
     */
    getFallbackRates() {
        const now = new Date();
        return Object.entries(this.fallbackRates).map(([materialType, price]) => ({
            materialType,
            pricePerKg: price,
            currency: 'RUB',
            lastUpdated: now,
            source: 'fallback',
            region: 'RU'
        }));
    }
    /**
     * Проверка доступности API биржи
     */
    checkApiHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/health`, {
                    timeout: 5000
                });
                return response.status === 200;
            }
            catch (_a) {
                return false;
            }
        });
    }
    /**
     * Обновление кэшированных цен в базе данных
     */
    updateCachedRates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rates = yield this.getMarketRates();
                // TODO: Сохранить в базу данных через Prisma
                console.log('📊 Обновлены кэшированные рыночные цены:', rates.length, 'позиций');
            }
            catch (error) {
                console.error('Ошибка обновления кэшированных цен:', error);
            }
        });
    }
}
// Экспорт singleton экземпляра
exports.recycleApi = new RecycleApiClient();
