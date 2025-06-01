"use strict";
/**
 * Расширенная система уведомлений для HimkaPlastic EcoTrack
 * Email, SMS, Push, Telegram, WhatsApp уведомления и чат-бот
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.enhancedNotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const web_push_1 = __importDefault(require("web-push"));
const telegram_bot_api_1 = __importDefault(require("telegram-bot-api"));
const twilio_1 = __importDefault(require("twilio"));
const uuid_1 = require("uuid");
class EnhancedNotificationService {
    constructor() {
        this.notificationQueue = [];
        this.templates = new Map();
        this.userPreferences = new Map();
        this.chatBotCommands = new Map();
        this.notificationHistory = new Map();
        this.isProcessing = false;
        this.webPushSubscriptions = new Map(); // userId -> subscription
        this.initializeServices();
        this.initializeTemplates();
        this.initializeChatBot();
        this.startQueueProcessor();
    }
    initializeServices() {
        // Email транспорт
        this.emailTransporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.yandex.ru',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'noreply@himkaplastic.ru',
                pass: process.env.SMTP_PASS || 'your-smtp-password'
            }
        });
        // Web Push конфигурация
        web_push_1.default.setVapidDetails('mailto:admin@himkaplastic.ru', process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key', process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key');
        // Telegram Bot
        if (process.env.TELEGRAM_BOT_TOKEN) {
            this.telegramBot = new telegram_bot_api_1.default({
                token: process.env.TELEGRAM_BOT_TOKEN
            });
        }
        // Twilio для SMS и WhatsApp
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    }
    initializeTemplates() {
        const templates = [
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
    initializeChatBot() {
        // Команды чат-бота
        const commands = [
            {
                command: '/start',
                description: 'Начать работу с ботом',
                handler: async (chatId) => {
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
                handler: async (chatId) => {
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
                handler: async (chatId, args) => {
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
                handler: async (chatId) => {
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
                handler: async (chatId) => {
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
                    }
                    else {
                        await this.sendTelegramMessage(chatId, 'Неизвестная команда. Введите /help для справки.');
                    }
                }
                else {
                    // Обработка обычных сообщений
                    await this.sendTelegramMessage(chatId, 'Спасибо за сообщение! Для использования бота введите одну из команд:\n/start, /orders, /help');
                }
            });
        }
    }
    startQueueProcessor() {
        // Обработчик очереди уведомлений
        setInterval(async () => {
            if (!this.isProcessing && this.notificationQueue.length > 0) {
                this.isProcessing = true;
                await this.processNotificationQueue();
                this.isProcessing = false;
            }
        }, 5000); // Каждые 5 секунд
    }
    async processNotificationQueue() {
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
            }
            catch (error) {
                console.error('Ошибка отправки уведомления:', error);
                // Логика повторных попыток
            }
        }
    }
    shouldSendNotification(notification, preferences) {
        // Проверка настроек типа уведомления
        const typeEnabled = {
            'email': preferences.email,
            'sms': preferences.sms,
            'push': preferences.push,
            'telegram': preferences.telegram,
            'whatsapp': preferences.whatsapp,
            'in-app': preferences.inApp
        }[notification.type];
        if (!typeEnabled)
            return false;
        // Проверка настроек категории
        const categoryEnabled = preferences.categories[notification.category];
        if (!categoryEnabled)
            return false;
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
            }
            else {
                // Дневной период
                if (currentTime >= startTime && currentTime <= endTime) {
                    return notification.priority === 'urgent';
                }
            }
        }
        return true;
    }
    removeFromQueue(notification) {
        const index = this.notificationQueue.indexOf(notification);
        if (index > -1) {
            this.notificationQueue.splice(index, 1);
        }
    }
    // Публичные методы
    /**
     * Добавление уведомления в очередь
     */
    async queueNotification(data) {
        const notificationId = (0, uuid_1.v4)();
        // Создание записи в истории
        const historyRecord = {
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
    async sendNotificationFromTemplate(templateId, userId, variables, overrides) {
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
        const notificationData = {
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
    async sendNotification(data) {
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
        }
        catch (error) {
            console.error(`Ошибка отправки ${data.type} уведомления:`, error);
            return false;
        }
    }
    /**
     * Email уведомления
     */
    async sendEmailNotification(data) {
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
        }
        catch (error) {
            console.error('❌ Ошибка отправки email:', error);
            return false;
        }
    }
    /**
     * SMS уведомления через Twilio
     */
    async sendSmsNotification(data) {
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
        }
        catch (error) {
            console.error('❌ Ошибка отправки SMS:', error);
            return false;
        }
    }
    /**
     * Push уведомления
     */
    async sendPushNotification(data) {
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
            await web_push_1.default.sendNotification(subscription, payload);
            console.log(`✅ Push уведомление отправлено пользователю ${data.userId}`);
            return true;
        }
        catch (error) {
            console.error('❌ Ошибка отправки Push:', error);
            return false;
        }
    }
    /**
     * Telegram уведомления
     */
    async sendTelegramNotification(data) {
        try {
            if (!data.telegramChatId) {
                console.log(`📱 Telegram симуляция: ${data.message}`);
                return true;
            }
            await this.sendTelegramMessage(data.telegramChatId, `${data.title}\n\n${data.message}`);
            console.log(`✅ Telegram сообщение отправлено в чат ${data.telegramChatId}`);
            return true;
        }
        catch (error) {
            console.error('❌ Ошибка отправки Telegram:', error);
            return false;
        }
    }
    /**
     * WhatsApp уведомления через Twilio
     */
    async sendWhatsAppNotification(data) {
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
        }
        catch (error) {
            console.error('❌ Ошибка отправки WhatsApp:', error);
            return false;
        }
    }
    /**
     * Внутренние уведомления приложения
     */
    async sendInAppNotification(data) {
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
        }
        catch (error) {
            console.error('❌ Ошибка in-app уведомления:', error);
            return false;
        }
    }
    // Вспомогательные методы
    async sendTelegramMessage(chatId, text) {
        if (this.telegramBot) {
            await this.telegramBot.sendMessage({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            });
        }
    }
    generateEmailTemplate(data) {
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
    setUserPreferences(userId, preferences) {
        this.userPreferences.set(userId, preferences);
    }
    /**
     * Получение настроек уведомлений пользователя
     */
    getUserPreferences(userId) {
        return this.userPreferences.get(userId) || null;
    }
    /**
     * Подписка на Web Push уведомления
     */
    subscribeWebPush(userId, subscription) {
        this.webPushSubscriptions.set(userId, subscription);
    }
    /**
     * Отписка от Web Push уведомлений
     */
    unsubscribeWebPush(userId) {
        this.webPushSubscriptions.delete(userId);
    }
    /**
     * Получение истории уведомлений (с поддержкой фильтрации и пагинации)
     */
    async getNotificationHistory(params) {
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
    async getNotificationStats(period) {
        const history = Array.from(this.notificationHistory.values());
        const now = new Date();
        let startDate;
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
        const stats = {
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
            if (record.status === 'sent')
                stats.sent++;
            else if (record.status === 'delivered')
                stats.delivered++;
            else if (record.status === 'failed')
                stats.failed++;
            else if (record.status === 'pending')
                stats.pending++;
            // Подсчет по типу
            stats.byType[record.type]++;
            // Подсчет по категории (если есть в метаданных)
            const category = record.metadata?.category || 'system';
            if (stats.byCategory[category] !== undefined) {
                stats.byCategory[category]++;
            }
        });
        return stats;
    }
    /**
     * Массовая отправка уведомлений
     */
    async sendBulkNotifications(userIds, templateId, variables) {
        const notificationIds = [];
        for (const userId of userIds) {
            try {
                const id = await this.sendNotificationFromTemplate(templateId, userId, variables);
                notificationIds.push(id);
            }
            catch (error) {
                console.error(`Ошибка отправки уведомления пользователю ${userId}:`, error);
            }
        }
        return notificationIds;
    }
    /**
     * Получение всех шаблонов уведомлений
     */
    async getTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Создание нового шаблона уведомлений
     */
    async createTemplate(templateData) {
        const template = {
            id: (0, uuid_1.v4)(),
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
    async updateTemplate(templateId, templateData) {
        const existingTemplate = this.templates.get(templateId);
        if (!existingTemplate) {
            throw new Error(`Шаблон с ID ${templateId} не найден`);
        }
        const updatedTemplate = {
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
    async deleteTemplate(templateId) {
        const deleted = this.templates.delete(templateId);
        if (deleted) {
            console.log(`✅ Шаблон ${templateId} удален`);
        }
        else {
            throw new Error(`Шаблон с ID ${templateId} не найден`);
        }
        return deleted;
    }
    /**
     * Подписка на Push уведомления (псевдоним для subscribeWebPush)
     */
    async subscribeToPush(userId, subscription) {
        this.subscribeWebPush(userId, subscription);
        console.log(`✅ Пользователь ${userId} подписан на Push уведомления`);
        return { success: true };
    }
    /**
     * Отписка от Push уведомлений (псевдоним для unsubscribeWebPush с endpoint)
     */
    async unsubscribeFromPush(userId, endpoint) {
        this.unsubscribeWebPush(userId);
        console.log(`✅ Пользователь ${userId} отписан от Push уведомлений`);
        return { success: true };
    }
    /**
     * Тестирование канала уведомлений
     */
    async testChannel(channel, recipient, message) {
        try {
            const testNotification = {
                userId: 'test-user',
                type: channel,
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
        }
        catch (error) {
            console.error(`Ошибка тестирования канала ${channel}:`, error);
            return {
                success: false,
                result: `Ошибка тестирования канала ${channel}: ${error.message}`
            };
        }
    }
    /**
     * Получение групп получателей
     */
    async getRecipientGroups() {
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
    async createRecipientGroup(groupData) {
        const group = {
            id: (0, uuid_1.v4)(),
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
    async unsubscribeByToken(token) {
        // В реальном приложении здесь будет проверка токена в БД и отписка пользователя
        console.log(`✅ Пользователь отписан по токену: ${token}`);
        return { success: true };
    }
    /**
     * Отправка уведомления о статусе заказа (обратная совместимость)
     */
    async sendOrderStatusNotification(orderId, status, userEmail, userPhone) {
        const statusMessages = {
            pending: 'Ваш заказ принят в обработку',
            processing: 'Ваш заказ находится в обработке',
            delivery: 'Ваш заказ передан в доставку',
            completed: 'Ваш заказ успешно завершён',
            cancelled: 'Ваш заказ отменён'
        };
        const message = statusMessages[status] || `Статус заказа изменён на: ${status}`;
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
exports.enhancedNotificationService = new EnhancedNotificationService();
// Экспорт для обратной совместимости
exports.notificationService = exports.enhancedNotificationService;
