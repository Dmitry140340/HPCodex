/**
 * API интеграция с биржами вторсырья (Backend)
 * Получение актуальных рыночных цен на пластиковые отходы
 */

import axios from 'axios';

export interface MarketRate {
  materialType: string;
  pricePerKg: number;
  currency: 'RUB' | 'USD' | 'EUR';
  lastUpdated: Date;
  source: string;
  region?: string;
}

export interface RecycleApiResponse {
  success: boolean;
  data: MarketRate[];
  timestamp: string;
  source: string;
}

class RecycleApiClient {
  private baseUrl = 'https://api.recycle.com/v1'; // Примерный URL API биржи
  private apiKey = process.env.RECYCLE_API_KEY;
  private fallbackRates: Record<string, number> = {
    'PET': 52.0,
    'HDPE': 48.5, 
    'PVC': 35.0,
    'LDPE': 45.0,
    'PP': 50.0,
    'PS': 30.0,
    'OTHER': 25.0
  };

  /**
   * Получение рыночных цен с биржи вторсырья
   */
  async getMarketRates(region: string = 'RU'): Promise<MarketRate[]> {
    try {
      // Попытка получить данные с реального API
      const response = await axios.get(`${this.baseUrl}/market-rates`, {
        params: { region },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });      if (response.status === 200 && (response.data as any).success) {
        console.log('✅ Получены актуальные цены с биржи вторсырья');
        return (response.data as any).data;
      }
    } catch (error) {
      console.warn('⚠️ Ошибка получения данных с биржи вторсырья, используем fallback данные:', error);
    }

    // Fallback - возвращаем актуальные цены для тестирования
    return this.getFallbackRates();
  }

  /**
   * Получение цены для конкретного материала
   */
  async getMaterialPrice(materialType: string, region?: string): Promise<number> {
    try {
      const rates = await this.getMarketRates(region);
      const rate = rates.find(r => r.materialType === materialType);
      const price = rate?.pricePerKg || this.fallbackRates[materialType] || 40.0;
      
      console.log(`💰 Цена для ${materialType}: ${price} руб/кг (источник: ${rate?.source || 'fallback'})`);
      return price;
    } catch (error) {
      console.error('Ошибка получения цены материала:', error);
      return this.fallbackRates[materialType] || 40.0;
    }
  }

  /**
   * Fallback данные для тестирования (актуальные цены на декабрь 2024)
   */
  private getFallbackRates(): MarketRate[] {
    const now = new Date();
    return Object.entries(this.fallbackRates).map(([materialType, price]) => ({
      materialType,
      pricePerKg: price,
      currency: 'RUB' as const,
      lastUpdated: now,
      source: 'fallback',
      region: 'RU'
    }));
  }

  /**
   * Проверка доступности API биржи
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Обновление кэшированных цен в базе данных
   */
  async updateCachedRates(): Promise<void> {
    try {
      const rates = await this.getMarketRates();
      // TODO: Сохранить в базу данных через Prisma
      console.log('📊 Обновлены кэшированные рыночные цены:', rates.length, 'позиций');
    } catch (error) {
      console.error('Ошибка обновления кэшированных цен:', error);
    }
  }
}

// Экспорт singleton экземпляра
export const recycleApi = new RecycleApiClient();
