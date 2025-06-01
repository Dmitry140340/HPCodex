/**
 * Сервис управления настройками уведомлений пользователей
 */

import { enhancedNotificationService, NotificationPreferences } from '../utils/enhancedNotifications';

export interface UserNotificationSettings {
  userId: string;
  preferences: NotificationPreferences;
  channels: {
    email: {
      enabled: boolean;
      address: string;
      verified: boolean;
    };
    sms: {
      enabled: boolean;
      phoneNumber: string;
      verified: boolean;
    };
    telegram: {
      enabled: boolean;
      chatId?: string;
      username?: string;
      connected: boolean;
    };
    whatsapp: {
      enabled: boolean;
      phoneNumber: string;
      verified: boolean;
    };
    push: {
      enabled: boolean;
      subscriptions: any[];
    };
  };
  unsubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

class NotificationPreferencesService {
  private userSettings: Map<string, UserNotificationSettings> = new Map();

  /**
   * Получение настроек пользователя
   */
  async getUserSettings(userId: string): Promise<UserNotificationSettings | null> {
    // В реальном приложении здесь будет запрос к БД
    let settings = this.userSettings.get(userId);
    
    if (!settings) {
      // Создание настроек по умолчанию
      settings = this.createDefaultSettings(userId);
      this.userSettings.set(userId, settings);
    }
    
    return settings;
  }

  /**
   * Обновление настроек пользователя
   */
  async updateUserSettings(userId: string, updates: Partial<UserNotificationSettings>): Promise<UserNotificationSettings> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) {
      throw new Error('Настройки пользователя не найдены');
    }

    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date()
    };

    this.userSettings.set(userId, updatedSettings);
    
    // Обновляем настройки в сервисе уведомлений
    enhancedNotificationService.setUserPreferences(userId, updatedSettings.preferences);
    
    return updatedSettings;
  }

  /**
   * Обновление предпочтений типов уведомлений
   */
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return;

    const updatedPreferences = {
      ...settings.preferences,
      ...preferences
    };

    await this.updateUserSettings(userId, {
      preferences: updatedPreferences
    });
  }

  /**
   * Обновление настроек каналов уведомлений
   */
  async updateChannelSettings(userId: string, channel: keyof UserNotificationSettings['channels'], channelSettings: any): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return;

    const updatedChannels = {
      ...settings.channels,
      [channel]: {
        ...settings.channels[channel],
        ...channelSettings
      }
    };

    await this.updateUserSettings(userId, {
      channels: updatedChannels
    });
  }

  /**
   * Подключение Telegram
   */
  async connectTelegram(userId: string, chatId: string, username?: string): Promise<void> {
    await this.updateChannelSettings(userId, 'telegram', {
      enabled: true,
      chatId,
      username,
      connected: true
    });
  }

  /**
   * Отключение канала уведомлений
   */
  async disconnectChannel(userId: string, channel: keyof UserNotificationSettings['channels']): Promise<void> {
    await this.updateChannelSettings(userId, channel, {
      enabled: false,
      connected: false
    });
  }

  /**
   * Подписка на Web Push
   */
  async subscribeWebPush(userId: string, subscription: any): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return;

    const currentSubscriptions = settings.channels.push.subscriptions || [];
    const updatedSubscriptions = [...currentSubscriptions, subscription];

    await this.updateChannelSettings(userId, 'push', {
      enabled: true,
      subscriptions: updatedSubscriptions
    });

    // Регистрируем подписку в сервисе уведомлений
    enhancedNotificationService.subscribeWebPush(userId, subscription);
  }

  /**
   * Отписка от Web Push
   */
  async unsubscribeWebPush(userId: string, endpoint?: string): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return;

    let updatedSubscriptions = settings.channels.push.subscriptions || [];
    
    if (endpoint) {
      // Удаляем конкретную подписку
      updatedSubscriptions = updatedSubscriptions.filter(sub => sub.endpoint !== endpoint);
    } else {
      // Удаляем все подписки
      updatedSubscriptions = [];
    }

    await this.updateChannelSettings(userId, 'push', {
      enabled: updatedSubscriptions.length > 0,
      subscriptions: updatedSubscriptions
    });

    enhancedNotificationService.unsubscribeWebPush(userId);
  }

  /**
   * Верификация email
   */
  async verifyEmail(userId: string, email: string): Promise<void> {
    await this.updateChannelSettings(userId, 'email', {
      address: email,
      verified: true
    });
  }

  /**
   * Верификация телефона
   */
  async verifyPhone(userId: string, phoneNumber: string): Promise<void> {
    await this.updateChannelSettings(userId, 'sms', {
      phoneNumber,
      verified: true
    });

    await this.updateChannelSettings(userId, 'whatsapp', {
      phoneNumber,
      verified: true
    });
  }

  /**
   * Установка тихих часов
   */
  async setQuietHours(userId: string, enabled: boolean, start: string, end: string, timezone: string): Promise<void> {
    await this.updateNotificationPreferences(userId, {
      quietHours: {
        enabled,
        start,
        end,
        timezone
      }
    });
  }

  /**
   * Включение/выключение категории уведомлений
   */
  async toggleCategory(userId: string, category: keyof NotificationPreferences['categories'], enabled: boolean): Promise<void> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return;

    const updatedCategories = {
      ...settings.preferences.categories,
      [category]: enabled
    };

    await this.updateNotificationPreferences(userId, {
      categories: updatedCategories
    });
  }

  /**
   * Отписка от всех уведомлений
   */
  async unsubscribeAll(userId: string): Promise<void> {
    await this.updateNotificationPreferences(userId, {
      email: false,
      sms: false,
      push: false,
      telegram: false,
      whatsapp: false,
      inApp: false,
      categories: {
        order: false,
        payment: false,
        delivery: false,
        system: false,
        marketing: false,
        analytics: false
      }
    });
  }

  /**
   * Отписка по токену (для email ссылок)
   */
  async unsubscribeByToken(token: string): Promise<boolean> {
    // Поиск пользователя по токену
    for (const [userId, settings] of this.userSettings.entries()) {
      if (settings.unsubscribeToken === token) {
        await this.unsubscribeAll(userId);
        return true;
      }
    }
    return false;
  }

  /**
   * Получение всех пользователей с включенным каналом
   */
  async getUsersWithEnabledChannel(channel: keyof UserNotificationSettings['channels']): Promise<string[]> {
    const userIds: string[] = [];
    
    for (const [userId, settings] of this.userSettings.entries()) {
      if (settings.channels[channel].enabled) {
        userIds.push(userId);
      }
    }
    
    return userIds;
  }

  /**
   * Получение контактных данных пользователя
   */
  async getUserContactInfo(userId: string): Promise<{
    email?: string;
    phone?: string;
    telegramChatId?: string;
  }> {
    const settings = await this.getUserSettings(userId);
    if (!settings) return {};

    return {
      email: settings.channels.email.verified ? settings.channels.email.address : undefined,
      phone: settings.channels.sms.verified ? settings.channels.sms.phoneNumber : undefined,
      telegramChatId: settings.channels.telegram.connected ? settings.channels.telegram.chatId : undefined
    };
  }

  /**
   * Создание настроек по умолчанию
   */
  private createDefaultSettings(userId: string): UserNotificationSettings {
    return {
      userId,      preferences: {
        userId,
        order: true,
        payment: true,
        delivery: true,
        system: true,
        marketing: false,
        analytics: false,
        email: true,
        sms: true,
        push: true,
        telegram: false,
        whatsapp: false,
        inApp: true,
        categories: {
          order: true,
          payment: true,
          delivery: true,
          system: true,
          marketing: false,
          analytics: false
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'Europe/Moscow'
        }
      },
      channels: {
        email: {
          enabled: true,
          address: '',
          verified: false
        },
        sms: {
          enabled: true,
          phoneNumber: '',
          verified: false
        },
        telegram: {
          enabled: false,
          connected: false
        },
        whatsapp: {
          enabled: false,
          phoneNumber: '',
          verified: false
        },
        push: {
          enabled: true,
          subscriptions: []
        }
      },
      unsubscribeToken: this.generateUnsubscribeToken(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Генерация токена для отписки
   */
  private generateUnsubscribeToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Экспорт настроек пользователя
   */
  async exportUserSettings(userId: string): Promise<UserNotificationSettings | null> {
    return await this.getUserSettings(userId);
  }

  /**
   * Импорт настроек пользователя
   */
  async importUserSettings(settings: UserNotificationSettings): Promise<void> {
    this.userSettings.set(settings.userId, {
      ...settings,
      updatedAt: new Date()
    });

    enhancedNotificationService.setUserPreferences(settings.userId, settings.preferences);
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
