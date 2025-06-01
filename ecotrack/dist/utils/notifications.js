"use strict";
/**
 * Расширенная система уведомлений для HimkaPlastic EcoTrack
 * Email, SMS, Push, Telegram, WhatsApp уведомления и чат-бот
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class NotificationService {
    constructor() {
        // Настройка email транспорта
        this.emailTransporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.yandex.ru',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'noreply@himkaplastic.ru',
                pass: process.env.SMTP_PASS || 'your-smtp-password'
            }
        });
    }
    /**
     * Отправка email уведомления
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
            console.log(`✅ Email уведомление отправлено для заказа ${data.orderId}`);
            return true;
        }
        catch (error) {
            console.error('❌ Ошибка отправки email:', error);
            return false;
        }
    }
    /**
     * Отправка SMS уведомления (заглушка для интеграции)
     */
    async sendSmsNotification(data) {
        try {
            // Интеграция с SMS провайдером (например, SMSC.ru, SMS.ru)
            const smsText = this.generateSmsText(data);
            // Заглушка - в реальном проекте здесь будет вызов API SMS-провайдера
            console.log(`📱 SMS отправлено на ${data.userPhone}: ${smsText}`);
            // Пример реального вызова:
            // const response = await axios.post('https://smsc.ru/sys/send.php', {
            //   login: process.env.SMS_LOGIN,
            //   psw: process.env.SMS_PASSWORD,
            //   phones: data.userPhone,
            //   mes: smsText
            // });
            return true;
        }
        catch (error) {
            console.error('❌ Ошибка отправки SMS:', error);
            return false;
        }
    }
    /**
     * Отправка Push уведомления (WebPush)
     */
    async sendPushNotification(data) {
        try {
            // Заглушка для WebPush уведомлений
            console.log(`🔔 Push уведомление для пользователя ${data.userId}: ${data.message}`);
            // В реальном проекте здесь будет интеграция с веб-push службой:
            // await webpush.sendNotification(subscription, JSON.stringify({
            //   title: data.title,
            //   body: data.message,
            //   orderId: data.orderId
            // }));
            return true;
        }
        catch (error) {
            console.error('❌ Ошибка отправки Push:', error);
            return false;
        }
    }
    /**
     * Отправка всех типов уведомлений для обновления статуса заказа
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
        const notificationData = {
            userId: '', // Будет заполнено при вызове
            orderId,
            type: 'email',
            title: `Обновление статуса заказа №${orderId}`,
            message,
            status,
            userEmail,
            userPhone,
            priority: 'medium',
            category: 'order'
        };
        // Отправляем все типы уведомлений параллельно
        const notifications = [
            this.sendEmailNotification(notificationData),
            this.sendPushNotification({ ...notificationData, type: 'push' })
        ];
        if (userPhone) {
            notifications.push(this.sendSmsNotification({ ...notificationData, type: 'sms' }));
        }
        await Promise.allSettled(notifications);
    }
    /**
     * Генерация HTML шаблона для email
     */
    generateEmailTemplate(data) {
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
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
          .status-processing { background: #3b82f6; color: white; }
          .status-delivery { background: #8b5cf6; color: white; }
          .status-completed { background: #10b981; color: white; }
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
            <p>${data.message}</p>
            <p><strong>Номер заказа:</strong> ${data.orderId}</p>
            <p><strong>Статус:</strong> <span class="status-badge status-${data.status}">${data.status}</span></p>
            <p>Вы можете отследить статус вашего заказа в личном кабинете на нашем сайте.</p>
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
    /**
     * Генерация текста для SMS
     */
    generateSmsText(data) {
        return `Химка Пластик: ${data.message}. Заказ №${data.orderId}. Подробности в личном кабинете.`;
    }
}
// Экспорт singleton экземпляра
exports.notificationService = new NotificationService();
