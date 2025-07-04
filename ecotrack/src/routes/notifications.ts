/**
 * Маршруты для управления уведомлениями HimkaPlastic EcoTrack
 */

import { Router } from 'express';
import { enhancedNotificationService } from '../utils/enhancedNotifications';
import { notificationPreferencesService } from '../services/notificationPreferencesService';

const router = Router();

// Получение истории уведомлений
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, userId } = req.query;
    
    const history = await enhancedNotificationService.getNotificationHistory({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      type: type as string,
      userId: userId as string
    });
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

// Отправка нового уведомления
router.post('/send', async (req, res) => {
  try {
    const notificationData = req.body;
    
    const result = await enhancedNotificationService.sendNotification(notificationData);
    res.json(result);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Массовая отправка уведомлений
router.post('/send/bulk', async (req, res) => {
  try {
    const { userIds, templateId, variables } = req.body;
    
    const result = await enhancedNotificationService.sendBulkNotifications(
      userIds,
      templateId,
      variables
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ error: 'Failed to send bulk notifications' });
  }
});

// Получение шаблонов уведомлений
router.get('/templates', async (req, res) => {
  try {
    const templates = await enhancedNotificationService.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Создание нового шаблона
router.post('/templates', async (req, res) => {
  try {
    const templateData = req.body;
    
    const template = await enhancedNotificationService.createTemplate(templateData);
    res.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Обновление шаблона
router.put('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const templateData = req.body;
    
    const template = await enhancedNotificationService.updateTemplate(templateId, templateData);
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Удаление шаблона
router.delete('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    await enhancedNotificationService.deleteTemplate(templateId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Получение настроек пользователя
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const preferences = await notificationPreferencesService.getUserSettings(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

// Обновление настроек пользователя
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    const updated = await notificationPreferencesService.updateUserSettings(userId, preferences);
    res.json(updated);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Подписка на push-уведомления
router.post('/push/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    
    const result = await enhancedNotificationService.subscribeWebPush(userId, subscription);
    res.json(result);
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});

// Отписка от push-уведомлений
router.post('/push/unsubscribe', async (req, res) => {
  try {
    const { userId, endpoint } = req.body;
    
    const result = await enhancedNotificationService.unsubscribeWebPush(userId);
    res.json(result);
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
});

// Тестирование каналов уведомлений
router.post('/test/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const { recipient, message } = req.body;
    
    const result = await enhancedNotificationService.testChannel(channel, recipient, message);
    res.json(result);
  } catch (error) {
    const { channel } = req.params;
    console.error(`Error testing ${channel} channel:`, error);
    res.status(500).json({ error: `Failed to test ${channel} channel` });
  }
});

// Получение статистики уведомлений
router.get('/stats', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const stats = await enhancedNotificationService.getNotificationStats(period as string);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

// Получение групп получателей
router.get('/groups', async (req, res) => {
  try {
    const groups = await enhancedNotificationService.getRecipientGroups();
    res.json(groups);
  } catch (error) {
    console.error('Error fetching recipient groups:', error);
    res.status(500).json({ error: 'Failed to fetch recipient groups' });
  }
});

// Создание группы получателей
router.post('/groups', async (req, res) => {
  try {
    const groupData = req.body;
    
    const group = await enhancedNotificationService.createRecipientGroup(groupData);
    res.json(group);
  } catch (error) {
    console.error('Error creating recipient group:', error);
    res.status(500).json({ error: 'Failed to create recipient group' });
  }
});

// Отписка по токену (для email)
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await enhancedNotificationService.unsubscribeByToken(token);
    
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Отписка успешна</h2>
          <p>Вы успешно отписались от уведомлений HimkaPlastic EcoTrack.</p>
          <p>Вы можете изменить настройки уведомлений в любое время в личном кабинете.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).send('Ошибка при отписке');
  }
});

export default router;
