/**
 * Расширенная система уведомлений для HimkaPlastic EcoTrack
 * Email, SMS, Push, Telegram, WhatsApp уведомления и чат-бот
 */

import nodemailer from 'nodemailer';
import webpush from 'web-push';
import TelegramBot from 'telegram-bot-api';
import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationData {
  userId: string;
  orderId?: string;
  type: 'email' | 'sms' | 'push' | 'telegram' | 'whatsapp' | 'in-app';
  title: string;
  message: string;
  status?: string;
  userEmail?: string;
  userPhone?: string;
  telegramChatId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'order' | 'payment' | 'delivery' | 'system' | 'marketing' | 'analytics';
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  telegram: boolean;
  whatsapp: boolean;
  inApp: boolean;
  categories: {
    order: boolean;
    payment: boolean;
    delivery: boolean;
    system: boolean;
    marketing: boolean;
    analytics: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationData['type'];
  category: NotificationData['category'];
  subject: string;
  body: string;
  variables: string[];
}

export interface ChatBotCommand {
  command: string;
  description: string;
  handler: (chatId: string, args: string[]) => Promise<string>;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  type: NotificationData['type'];
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface RecipientGroup {
  id: string;
  name: string;
  description: string;
  userIds: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  byType: {
    email: number;
    sms: number;
    push: number;
    telegram: number;
    whatsapp: number;
    'in-app': number;
  };
  byCategory: {
    order: number;
    payment: number;
    delivery: number;
    system: number;
    marketing: number;
    analytics: number;
  };
  period: string;
  startDate: Date;
  endDate: Date;
}

class EnhancedNotificationService {
  private emailTransporter: nodemailer.Transporter;
  private telegramBot: TelegramBot;
  private twilioClient: any;
  private notificationQueue: NotificationData[] = [];
  private templates: Map<string, NotificationTemplate> = new Map();
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private chatBotCommands: Map<string, ChatBotCommand> = new Map();
  private notificationHistory: Map<string, NotificationHistory> = new Map();
  private isProcessing = false;
  private webPushSubscriptions: Map<string, any> = new Map(); // userId -> subscription

  constructor() {
    this.initializeServices();
    this.initializeTemplates();
    this.initializeChatBot();
    this.startQueueProcessor();
  }

  private initializeServices() {
    // Email транспорт
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.yandex.ru',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'noreply@himkaplastic.ru',
        pass: process.env.SMTP_PASS || 'your-smtp-password'
      }
    });

    // Web Push конфигурация
    webpush.setVapidDetails(
      'mailto:admin@himkaplastic.ru',
      process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key',
      process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key'
    );

    // Telegram Bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.telegramBot = new TelegramBot({
        token: process.env.TELEGRAM_BOT_TOKEN
      });
    }

    // Twilio для SMS и WhatsApp
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  private initializeTemplates() {
    const templates: NotificationTemplate[] = [
      {
        id: 'order-created',
        name: 'Заказ создан',
        type: 'email',
        category: 'order',
        subject: 'Заказ №{{orderId}} принят в обработку',
        body: 'Здравствуйте, {{userName}}!\n\nВаш заказ №{{orderId}} принят в обработку.\nСумма заказа: {{orderAmount}} руб.\n\nВы можете отследить статус заказа в личном кабинете.',
        variables: ['userName', 'orderId', 'orderAmount']
      },
      {
        id: 'order-status-changed',
        name: 'Изменение статуса заказа',
        type: 'push',
        category: 'order',
        subject: 'Обновление заказа №{{orderId}}',
        body: 'Статус вашего заказа №{{orderId}} изменен на: {{newStatus}}',
        variables: ['orderId', 'newStatus']
      },
      {
        id: 'payment-received',
        name: 'Платеж получен',
        type: 'sms',
        category: 'payment',
        subject: 'Платеж подтвержден',
        body: 'Платеж по заказу №{{orderId}} на сумму {{amount}} руб. подтвержден.',
        variables: ['orderId', 'amount']
      },
      {
        id: 'delivery-notification',
        name: 'Уведомление о доставке',
        type: 'telegram',
        category: 'delivery',
        subject: '🚚 Доставка заказа №{{orderId}}',
        body: 'Ваш заказ №{{orderId}} будет доставлен {{deliveryDate}} с {{deliveryTime}}.\nТрек-номер: {{trackingNumber}}',
        variables: ['orderId', 'deliveryDate', 'deliveryTime', 'trackingNumber']
      },
      {
        id: 'system-maintenance',
        name: 'Техническое обслуживание',
        type: 'email',
        category: 'system',
        subject: 'Плановые технические работы',
        body: 'Уважаемые клиенты!\n\n{{maintenanceDate}} с {{startTime}} до {{endTime}} будут проводиться плановые технические работы.\nВозможны перебои в работе сервиса.',
        variables: ['maintenanceDate', 'startTime', 'endTime']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeChatBot() {
    // Команды чат-бота
    const commands: ChatBotCommand[] = [
      {
        command: '/start',
        description: 'Начать работу с ботом',
        handler: async (chatId: string) => {
          return 'Добро пожаловать в EcoTrack от ООО "Химка Пластик"!\n\n' +
                 'Доступные команды:\n' +
                 '/orders - Мои заказы\n' +
                 '/status <номер_заказа> - Статус заказа\n' +
                 '/help - Помощь\n' +
                 '/settings - Настройки уведомлений';
        }
      },
      {
        command: '/orders',
        description: 'Показать мои заказы',
        handler: async (chatId: string) => {
          // В реальном приложении здесь будет запрос к БД
          return 'Ваши последние заказы:\n\n' +
                 '📦 Заказ №ECO-2025-001 - В обработке\n' +
                 '📦 Заказ №ECO-2025-002 - Доставляется\n' +
                 '✅ Заказ №ECO-2024-999 - Завершен';
        }
      },
      {
        command: '/status',
        description: 'Проверить статус заказа',
        handler: async (chatId: string, args: string[]) => {
          const orderId = args[0];
          if (!orderId) {
            return 'Укажите номер заказа. Пример: /status ECO-2025-001';
          }
          // В реальном приложении здесь будет запрос к БД
          return `📦 Заказ №${orderId}\n` +
                 '📍 Статус: В обработке\n' +
                 '💰 Сумма: 15,500 руб.\n' +
                 '📅 Дата создания: 15.01.2025\n' +
                 '🚚 Ожидаемая доставка: 20.01.2025';
        }
      },
      {
        command: '/help',
        description: 'Показать справку',
        handler: async (chatId: string) => {
          return '🤖 Справка по EcoTrack боту\n\n' +
                 'Этот бот поможет вам:\n' +
                 '• Отслеживать заказы\n' +
                 '• Получать уведомления\n' +
                 '• Управлять настройками\n\n' +
                 'По вопросам обращайтесь: +7 (495) 123-45-67';
        }
      },
      {
        command: '/settings',
        description: 'Настройки уведомлений',
        handler: async (chatId: string) => {
          return '⚙️ Настройки уведомлений\n\n' +
                 'Для изменения настроек перейдите в личный кабинет на сайте или напишите нашему оператору.\n\n' +
                 'Текущие настройки:\n' +
                 '✅ Уведомления о заказах\n' +
                 '✅ Уведомления о доставке\n' +
                 '❌ Маркетинговые рассылки';
        }
      }
    ];

    commands.forEach(command => {
      this.chatBotCommands.set(command.command, command);
    });

    // Обработчик сообщений Telegram
    if (this.telegramBot) {
      this.telegramBot.on('message', async (message) => {
        const chatId = message.chat.id.toString();
        const text = message.text || '';
        
        if (text.startsWith('/')) {
          const [command, ...args] = text.split(' ');
          const botCommand = this.chatBotCommands.get(command);
          
          if (botCommand) {
            const response = await botCommand.handler(chatId, args);
            await this.sendTelegramMessage(chatId, response);
          } else {
            await this.sendTelegramMessage(chatId, 'Неизвестная команда. Введите /help для справки.');
          }
        } else {
          // Обработка обычных сообщений
          await this.sendTelegramMessage(chatId, 
            'Спасибо за сообщение! Для использования бота введите одну из команд:\n/start, /orders, /help'
          );
        }
      });
    }
  }

  private startQueueProcessor() {
    // Обработчик очереди уведомлений
    setInterval(async () => {
      if (!this.isProcessing && this.notificationQueue.length > 0) {
        this.isProcessing = true;
        await this.processNotificationQueue();
        this.isProcessing = false;
      }
    }, 5000); // Каждые 5 секунд
  }

  private async processNotificationQueue() {
    const now = new Date();
    const pendingNotifications = this.notificationQueue.filter(notification => {
      return !notification.scheduledFor || notification.scheduledFor <= now;
    });

    for (const notification of pendingNotifications) {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.removeFromQueue(notification);
        continue;
      }

      const preferences = this.userPreferences.get(notification.userId);
      if (preferences && !this.shouldSendNotification(notification, preferences)) {
        continue;
      }

      try {
        await this.sendNotification(notification);
        this.removeFromQueue(notification);
      } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
        // Логика повторных попыток
      }
    }
  }

  private shouldSendNotification(notification: NotificationData, preferences: NotificationPreferences): boolean {
    // Проверка настроек типа уведомления
    const typeEnabled = {
      'email': preferences.email,
      'sms': preferences.sms,
      'push': preferences.push,
      'telegram': preferences.telegram,
      'whatsapp': preferences.whatsapp,
      'in-app': preferences.inApp
    }[notification.type];

    if (!typeEnabled) return false;

    // Проверка настроек категории
    const categoryEnabled = preferences.categories[notification.category];
    if (!categoryEnabled) return false;

    // Проверка тихих часов
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().substr(0, 5);
      const startTime = preferences.quietHours.start;
      const endTime = preferences.quietHours.end;

      if (startTime > endTime) {
        // Ночной период (например, 22:00 - 08:00)
        if (currentTime >= startTime || currentTime <= endTime) {
          return notification.priority === 'urgent';
        }
      } else {
        // Дневной период
        if (currentTime >= startTime && currentTime <= endTime) {
          return notification.priority === 'urgent';
        }
      }
    }

    return true;
  }

  private removeFromQueue(notification: NotificationData) {
    const index = this.notificationQueue.indexOf(notification);
    if (index > -1) {
      this.notificationQueue.splice(index, 1);
    }
  }

  // Публичные методы
  
  /**
   * Добавление уведомления в очередь
   */
  async queueNotification(data: NotificationData): Promise<string> {
    const notificationId = uuidv4();
    
    // Создание записи в истории
    const historyRecord: NotificationHistory = {
      id: notificationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      status: 'pending',
      retryCount: 0,
      metadata: data.metadata
    };
    
    this.notificationHistory.set(notificationId, historyRecord);
    this.notificationQueue.push(data);
    
    console.log(`📝 Уведомление добавлено в очередь: ${notificationId}`);
    return notificationId;
  }

  /**
   * Отправка уведомления по шаблону
   */
  async sendNotificationFromTemplate(
    templateId: string,
    userId: string,
    variables: Record<string, string>,
    overrides?: Partial<NotificationData>
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Шаблон ${templateId} не найден`);
    }

    let subject = template.subject;
    let body = template.body;

    // Подстановка переменных
    for (const [key, value] of Object.entries(variables)) {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const notificationData: NotificationData = {
      userId,
      type: template.type,
      category: template.category,
      title: subject,
      message: body,
      priority: 'medium',
      ...overrides
    };

    return await this.queueNotification(notificationData);
  }

  /**
   * Отправка немедленного уведомления
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      switch (data.type) {
        case 'email':
          return await this.sendEmailNotification(data);
        case 'sms':
          return await this.sendSmsNotification(data);
        case 'push':
          return await this.sendPushNotification(data);
        case 'telegram':
          return await this.sendTelegramNotification(data);
        case 'whatsapp':
          return await this.sendWhatsAppNotification(data);
        case 'in-app':
          return await this.sendInAppNotification(data);
        default:
          throw new Error(`Неподдерживаемый тип уведомления: ${data.type}`);
      }
    } catch (error) {
      console.error(`Ошибка отправки ${data.type} уведомления:`, error);
      return false;
    }
  }

  /**
   * Email уведомления
   */
  async sendEmailNotification(data: NotificationData): Promise<boolean> {
    try {
      const emailContent = this.generateEmailTemplate(data);
      
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || '"ООО Химка Пластик" <noreply@himkaplastic.ru>',
        to: data.userEmail,
        subject: data.title,
        html: emailContent,
        text: data.message
      });

      console.log(`✅ Email отправлен пользователю ${data.userId}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error);
      return false;
    }
  }

  /**
   * SMS уведомления через Twilio
   */
  async sendSmsNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!this.twilioClient || !data.userPhone) {
        console.log(`📱 SMS симуляция для ${data.userPhone}: ${data.message}`);
        return true;
      }

      await this.twilioClient.messages.create({
        body: data.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.userPhone
      });

      console.log(`✅ SMS отправлен на ${data.userPhone}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки SMS:', error);
      return false;
    }
  }

  /**
   * Push уведомления
   */
  async sendPushNotification(data: NotificationData): Promise<boolean> {
    try {
      const subscription = this.webPushSubscriptions.get(data.userId);
      
      if (!subscription) {
        console.log(`🔔 Push симуляция для ${data.userId}: ${data.message}`);
        return true;
      }

      const payload = JSON.stringify({
        title: data.title,
        body: data.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          orderId: data.orderId,
          category: data.category,
          userId: data.userId
        }
      });

      await webpush.sendNotification(subscription, payload);
      console.log(`✅ Push уведомление отправлено пользователю ${data.userId}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки Push:', error);
      return false;
    }
  }

  /**
   * Telegram уведомления
   */
  async sendTelegramNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!data.telegramChatId) {
        console.log(`📱 Telegram симуляция: ${data.message}`);
        return true;
      }

      await this.sendTelegramMessage(data.telegramChatId, `${data.title}\n\n${data.message}`);
      console.log(`✅ Telegram сообщение отправлено в чат ${data.telegramChatId}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки Telegram:', error);
      return false;
    }
  }

  /**
   * WhatsApp уведомления через Twilio
   */
  async sendWhatsAppNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!this.twilioClient || !data.userPhone) {
        console.log(`📱 WhatsApp симуляция для ${data.userPhone}: ${data.message}`);
        return true;
      }

      await this.twilioClient.messages.create({
        body: data.message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${data.userPhone}`
      });

      console.log(`✅ WhatsApp сообщение отправлено на ${data.userPhone}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки WhatsApp:', error);
      return false;
    }
  }

  /**
   * Внутренние уведомления приложения
   */
  async sendInAppNotification(data: NotificationData): Promise<boolean> {
    try {
      // В реальном приложении здесь будет сохранение в БД и отправка через WebSocket
      console.log(`🔔 Внутреннее уведомление для ${data.userId}: ${data.message}`);
      
      // Эмуляция сохранения в базе данных
      // await db.notification.create({
      //   data: {
      //     userId: data.userId,
      //     title: data.title,
      //     message: data.message,
      //     type: 'in-app',
      //     read: false,
      //     createdAt: new Date()
      //   }
      // });

      return true;
    } catch (error) {
      console.error('❌ Ошибка in-app уведомления:', error);
      return false;
    }
  }

  // Вспомогательные методы

  private async sendTelegramMessage(chatId: string, text: string): Promise<void> {
    if (this.telegramBot) {
      await this.telegramBot.sendMessage({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      });
    }
  }

  private generateEmailTemplate(data: NotificationData): string {
    const priorityColors = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .priority-badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: bold; 
            color: white;
            background: ${priorityColors[data.priority]};
          }
          .category-badge { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 11px; 
            background: #e5e7eb; 
            color: #374151;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ООО «Химка Пластик»</h1>
            <p>Система переработки отходов EcoTrack</p>
          </div>
          <div class="content">
            <h2>${data.title}</h2>
            <p>
              <span class="priority-badge">${data.priority.toUpperCase()}</span>
              <span class="category-badge">${data.category}</span>
            </p>
            <p>${data.message}</p>
            ${data.orderId ? `<p><strong>Номер заказа:</strong> ${data.orderId}</p>` : ''}
            <p>Время отправки: ${new Date().toLocaleString('ru-RU')}</p>
          </div>
          <div class="footer">
            <p>© 2025 ООО «Химка Пластик». Все права защищены.</p>
            <p>Это автоматическое сообщение, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Методы управления настройками

  /**
   * Установка настроек уведомлений пользователя
   */
  setUserPreferences(userId: string, preferences: NotificationPreferences): void {
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Получение настроек уведомлений пользователя
   */
  getUserPreferences(userId: string): NotificationPreferences | null {
    return this.userPreferences.get(userId) || null;
  }

  /**
   * Подписка на Web Push уведомления
   */
  subscribeWebPush(userId: string, subscription: any): void {
    this.webPushSubscriptions.set(userId, subscription);
  }

  /**
   * Отписка от Web Push уведомлений
   */
  unsubscribeWebPush(userId: string): void {
    this.webPushSubscriptions.delete(userId);
  }

  /**
   * Получение истории уведомлений (с поддержкой фильтрации и пагинации)
   */
  async getNotificationHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    userId?: string;
  }): Promise<{ notifications: NotificationHistory[]; total: number; page: number; limit: number }> {
    let notifications = Array.from(this.notificationHistory.values());
    
    // Применяем фильтры
    if (params?.userId) {
      notifications = notifications.filter(n => n.userId === params.userId);
    }
    if (params?.status) {
      notifications = notifications.filter(n => n.status === params.status);
    }
    if (params?.type) {
      notifications = notifications.filter(n => n.type === params.type);
    }

    // Сортируем по дате отправки
    notifications.sort((a, b) => {
      const dateA = a.sentAt || new Date(0);
      const dateB = b.sentAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    const total = notifications.length;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    return {
      notifications: paginatedNotifications,
      total,
      page,
      limit
    };
  }

  /**
   * Получение статистики уведомлений (с поддержкой периода)
   */
  async getNotificationStats(period?: string): Promise<NotificationStats> {
    const history = Array.from(this.notificationHistory.values());
    const now = new Date();
    let startDate: Date;

    // Определяем начальную дату в зависимости от периода
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Фильтруем уведомления по периоду
    const periodHistory = history.filter(record => {
      const recordDate = record.sentAt || new Date();
      return recordDate >= startDate;
    });

    const stats: NotificationStats = {
      total: periodHistory.length,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      byType: {
        email: 0,
        sms: 0,
        push: 0,
        telegram: 0,
        whatsapp: 0,
        'in-app': 0
      },
      byCategory: {
        order: 0,
        payment: 0,
        delivery: 0,
        system: 0,
        marketing: 0,
        analytics: 0
      },
      period: period || 'month',
      startDate,
      endDate: now
    };

    periodHistory.forEach(record => {
      // Подсчет по статусу
      if (record.status === 'sent') stats.sent++;
      else if (record.status === 'delivered') stats.delivered++;
      else if (record.status === 'failed') stats.failed++;
      else if (record.status === 'pending') stats.pending++;
      
      // Подсчет по типу
      stats.byType[record.type]++;
      
      // Подсчет по категории (если есть в метаданных)
      const category = record.metadata?.category || 'system';
      if (stats.byCategory[category as keyof typeof stats.byCategory] !== undefined) {
        stats.byCategory[category as keyof typeof stats.byCategory]++;
      }
    });

    return stats;
  }

  /**
   * Массовая отправка уведомлений
   */
  async sendBulkNotifications(
    userIds: string[],
    templateId: string,
    variables: Record<string, string>
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const userId of userIds) {
      try {
        const id = await this.sendNotificationFromTemplate(templateId, userId, variables);
        notificationIds.push(id);
      } catch (error) {
        console.error(`Ошибка отправки уведомления пользователю ${userId}:`, error);
      }
    }

    return notificationIds;
  }

  /**
   * Получение всех шаблонов уведомлений
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Создание нового шаблона уведомлений
   */
  async createTemplate(templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const template: NotificationTemplate = {
      id: uuidv4(),
      name: templateData.name || 'Новый шаблон',
      type: templateData.type || 'email',
      category: templateData.category || 'system',
      subject: templateData.subject || '',
      body: templateData.body || '',
      variables: templateData.variables || []
    };

    this.templates.set(template.id, template);
    console.log(`✅ Шаблон ${template.name} создан с ID: ${template.id}`);
    return template;
  }

  /**
   * Обновление существующего шаблона
   */
  async updateTemplate(templateId: string, templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) {
      throw new Error(`Шаблон с ID ${templateId} не найден`);
    }

    const updatedTemplate: NotificationTemplate = {
      ...existingTemplate,
      ...templateData,
      id: templateId // Ensure ID doesn't change
    };

    this.templates.set(templateId, updatedTemplate);
    console.log(`✅ Шаблон ${templateId} обновлен`);
    return updatedTemplate;
  }

  /**
   * Удаление шаблона
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      console.log(`✅ Шаблон ${templateId} удален`);
    } else {
      throw new Error(`Шаблон с ID ${templateId} не найден`);
    }
    return deleted;
  }

  /**
   * Подписка на Push уведомления (псевдоним для subscribeWebPush)
   */
  async subscribeToPush(userId: string, subscription: any): Promise<{ success: boolean }> {
    this.subscribeWebPush(userId, subscription);
    console.log(`✅ Пользователь ${userId} подписан на Push уведомления`);
    return { success: true };
  }

  /**
   * Отписка от Push уведомлений (псевдоним для unsubscribeWebPush с endpoint)
   */
  async unsubscribeFromPush(userId: string, endpoint?: string): Promise<{ success: boolean }> {
    this.unsubscribeWebPush(userId);
    console.log(`✅ Пользователь ${userId} отписан от Push уведомлений`);
    return { success: true };
  }

  /**
   * Тестирование канала уведомлений
   */
  async testChannel(channel: string, recipient: string, message: string): Promise<{ success: boolean; result: string }> {
    try {
      const testNotification: NotificationData = {
        userId: 'test-user',
        type: channel as NotificationData['type'],
        title: 'Тестовое уведомление',
        message: message || 'Это тестовое сообщение для проверки канала уведомлений',
        priority: 'low',
        category: 'system',
        userEmail: channel === 'email' ? recipient : undefined,
        userPhone: (channel === 'sms' || channel === 'whatsapp') ? recipient : undefined,
        telegramChatId: channel === 'telegram' ? recipient : undefined
      };

      const result = await this.sendNotification(testNotification);
      
      return {
        success: result,
        result: result ? 
          `Тестовое уведомление через ${channel} успешно отправлено на ${recipient}` :
          `Ошибка отправки тестового уведомления через ${channel}`
      };
    } catch (error) {
      console.error(`Ошибка тестирования канала ${channel}:`, error);
      return {
        success: false,
        result: `Ошибка тестирования канала ${channel}: ${(error as Error).message}`
      };
    }
  }

  /**
   * Получение групп получателей
   */
  async getRecipientGroups(): Promise<RecipientGroup[]> {
    // В реальном приложении это будет запрос к БД
    return [
      {
        id: 'all-customers',
        name: 'Все клиенты',
        description: 'Все зарегистрированные клиенты',
        userIds: ['user1', 'user2', 'user3'],
        createdAt: new Date(),
        isActive: true
      },
      {
        id: 'premium-customers',
        name: 'Премиум клиенты',
        description: 'Клиенты с премиум подпиской',
        userIds: ['user1'],
        createdAt: new Date(),
        isActive: true
      },
      {
        id: 'managers',
        name: 'Менеджеры',
        description: 'Сотрудники компании',
        userIds: ['manager1', 'manager2'],
        createdAt: new Date(),
        isActive: true
      }
    ];
  }

  /**
   * Создание группы получателей
   */
  async createRecipientGroup(groupData: Partial<RecipientGroup>): Promise<RecipientGroup> {
    const group: RecipientGroup = {
      id: uuidv4(),
      name: groupData.name || 'Новая группа',
      description: groupData.description || '',
      userIds: groupData.userIds || [],
      createdAt: new Date(),
      isActive: groupData.isActive !== undefined ? groupData.isActive : true
    };

    // В реальном приложении здесь будет сохранение в БД
    console.log(`✅ Группа получателей "${group.name}" создана с ID: ${group.id}`);
    return group;
  }

  /**
   * Отписка по токену
   */
  async unsubscribeByToken(token: string): Promise<{ success: boolean }> {
    // В реальном приложении здесь будет проверка токена в БД и отписка пользователя
    console.log(`✅ Пользователь отписан по токену: ${token}`);
    return { success: true };
  }

  /**
   * Отправка уведомления о статусе заказа (обратная совместимость)
   */
  async sendOrderStatusNotification(orderId: string, status: string, userEmail: string, userPhone?: string): Promise<void> {
    const statusMessages = {
      pending: 'Ваш заказ принят в обработку',
      processing: 'Ваш заказ находится в обработке',
      delivery: 'Ваш заказ передан в доставку',
      completed: 'Ваш заказ успешно завершён',
      cancelled: 'Ваш заказ отменён'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Статус заказа изменён на: ${status}`;
    
    // Предполагаем, что userId можно получить из email (в реальном приложении из БД)
    const userId = `user_${userEmail.split('@')[0]}`;

    await this.sendNotificationFromTemplate('order-status-changed', userId, {
      orderId,
      newStatus: status
    }, {
      userEmail,
      userPhone,
      priority: 'medium'
    });
  }
}

// Экспорт singleton экземпляра
export const enhancedNotificationService = new EnhancedNotificationService();

// Экспорт для обратной совместимости
export const notificationService = enhancedNotificationService;
