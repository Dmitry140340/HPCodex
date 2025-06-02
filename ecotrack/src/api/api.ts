import { db } from "../server/db";
import { getAuth, sendEmail, signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from "../server/actions";
import type { User, Order, MarketRate, PriceCalculation, FinancialReport, Analytics } from "../utils/api";
import type { InventoryItem, LogisticRoute, RouteOption, OrderDocument } from "../types/temp-models";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getRegionFromAddress, calculateDistance, HIMKA_PLASTIC_ADDRESS, HIMKA_PLASTIC_COORDINATES } from "../utils/yandexMaps";
import { enhancedNotificationService } from '../utils/enhancedNotifications';
import { notificationPreferencesService } from '../services/notificationPreferencesService';
import { analyticsService } from '../services/analyticsService';

// Helper type for order data
interface OrderData {
  materialType: string;
  volume: number;
  pickupAddress: string;
  userId?: string;
  price?: number;
  status?: string;
  environmentalImpact?: number;
}

// Helper type for calculating price
interface PriceParams {
  materialType: string;
  volume: number;
  pickupAddress: string;
  distance?: number;
}

// Authentication handlers
export { signIn, signOut, signUp } from "../server/actions";

// Helper function to get users by role
export async function getUsersByRole(role: 'client' | 'manager' | 'logistic' | 'admin'): Promise<User[]> {
  // В текущей системе роль определяется по email домену в actions.ts
  // Получаем всех пользователей и фильтруем по email
  const allUsers = await db.user.findMany();
  
  return allUsers.filter(user => {
    let userRole: 'client' | 'manager' | 'logistic' | 'admin' = 'client';
    
    if (user.isAdmin || user.email.endsWith('@admin.com') || user.email === 'admin@himkaplastic.ru') {
      userRole = 'admin';
    } else if (user.email.endsWith('@manager.com')) {
      userRole = 'manager';
    } else if (user.email.endsWith('@logistic.com')) {
      userRole = 'logistic';
    }
    
    return userRole === role;
  }).map(user => prismaUserToUser(user));
}



// User Management
function prismaUserToUser(user: any): User {
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

export async function getCurrentUser(authContext?: any): Promise<User> {
  // Use provided auth context or fall back to getAuth()
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return prismaUserToUser(user);
}

export async function updateUserProfile(data: Partial<User>, authContext?: any): Promise<User> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }
  const user = await db.user.update({
    where: { id: auth.userId },
    data,
  });
  return prismaUserToUser(user);
}

// Market Rates
// TODO: Реализовать через Prisma или убрать, если не используется
export async function getMarketRates(): Promise<MarketRate[]> {
  // return db.marketRate.findMany();
  return [];
}

export async function updateMarketRate(input: {
  materialType: string;
  pricePerKg: number;
}): Promise<MarketRate> {
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
async function getDistanceFromAddress(address: string): Promise<number> {
  try {
    // Используем адрес завода ООО Химка пластик как точку отсчета
    const distance = await calculateDistance(HIMKA_PLASTIC_ADDRESS, address);
    return distance ?? 0; // Возвращаем 0, если undefined
  } catch (error) {
    console.error("Failed to calculate distance using Yandex Maps:", error);
    // Fallback to our previous implementation
    return fallbackCalculateDistance(address);
  }
}

// Fallback function for distance calculation
async function fallbackCalculateDistance(address: string): Promise<number> {
  // In a production app, this would use a maps API (Google Maps, Yandex Maps)
  // For now, we'll simulate distances based on regions
  let region: string;
  try {
    region = await getRegionFromAddress(address);
  } catch (error) {
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
function getFallbackRegion(address: string): string {
  const addressLower = address.toLowerCase();
  if (addressLower.includes("москва") || addressLower.includes("moscow")) {
    return "Москва";
  } else if (addressLower.includes("санкт-петербург") || addressLower.includes("saint petersburg") || addressLower.includes("st. petersburg")) {
    return "Санкт-Петербург";
  } else if (addressLower.includes("екатеринбург") || addressLower.includes("ekaterinburg")) {
    return "Екатеринбург";
  } else if (addressLower.includes("новосибирск") || addressLower.includes("novosibirsk")) {
    return "Новосибирск";
  }
  return "По умолчанию";
}

export async function calculateOrderPrice(orderData: PriceParams): Promise<PriceCalculation> {
  // Получаем актуальную рыночную цену с биржи вторсырья
  const { recycleApi } = await import('../utils/recycleApi');
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
  const region = await getRegionFromAddress(orderData.pickupAddress);
  const environmentalImpact = safeVolume * 1.5; // 1.5kg CO2 saved per kg recycled
  
  // Формула по ТЗ: C = (P_m * V) + (L_d * D) + T_c + M_e
  // P_m - средняя рыночная стоимость от API бирж
  // V - объем заказа, введенный пользователем  
  // L_d - 70 рублей константа
  // D - расстояние от API Яндекс.Карт
  const basePrice = safeVolume * materialPrice; // (P_m * V)
  
  // Расчет логистических расходов через картографические API
  const logisticsCost = await calculateLogisticsCosts(orderData.pickupAddress, safeDistance);
  
  // Добавляем экологические налоги и таможенные сборы
  const environmentalTax = safeVolume * environmentalTaxRate; // M_e
  const totalCustomsDuty = await calculateCustomsDuty(orderData.materialType, safeVolume);
  
  let totalPrice = basePrice + logisticsCost + totalCustomsDuty + environmentalTax;
  if (totalPrice < 0) totalPrice = 0;

  return {
    basePrice,
    logisticsCost,
    customsDuty: totalCustomsDuty,
    environmentalTax,
    distance: safeDistance,
    region,
    totalPrice,
    environmentalImpact,
    price: totalPrice,
  };
}

// Calculate logistics costs using Google Maps/Yandex Maps API
async function calculateLogisticsCosts(pickupAddress: string, distance: number): Promise<number> {
  try {
    const LOGISTICS_COST_PER_KM = 70;
    
    // Get traffic conditions and route optimization from mapping API
    const { yandexMapsService } = await import('../utils/yandexMaps');
    const routeInfo = await yandexMapsService.getOptimalRoute(pickupAddress, 'Москва, центр переработки');
    
    if (routeInfo && routeInfo.distance) {
      const actualDistance = routeInfo.distance / 1000; // Convert to km
      const trafficMultiplier = routeInfo.duration > actualDistance * 60 ? 1.2 : 1.0; // Traffic penalty
      return actualDistance * LOGISTICS_COST_PER_KM * trafficMultiplier;
    }
    
    // Fallback to simple calculation
    return distance * LOGISTICS_COST_PER_KM;
  } catch (error) {
    console.error('Error calculating logistics costs via API:', error);
    // Fallback to simple calculation
    return distance * 70;
  }
}

// Calculate customs duty based on material type and volume
async function calculateCustomsDuty(materialType: string, volume: number): Promise<number> {
  const customsRates = {
    'PET': 150,
    'HDPE': 180,
    'PP': 160,
    'PVC': 200,
    'PS': 170,
    'PC': 220,
    'Other': 200
  };
  
  const baseRate = customsRates[materialType] || customsRates['Other'];
  
  // Volume-based scaling
  const volumeMultiplier = volume > 1000 ? 1.1 : 1.0;
  
  return baseRate * volumeMultiplier;
}

export async function createOrder(orderData: OrderData, authContext?: any): Promise<Order> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  // Валидация данных клиента (тип сырья, объём, адрес)
  const validationResult = await validateOrderData(orderData);
  if (!validationResult.isValid) {
    throw new Error(`Ошибка валидации данных: ${validationResult.errors.join(', ')}`);
  }

  // Check inventory availability before proceeding
  const isAvailable = await checkInventoryAvailability(orderData.materialType, orderData.volume);
  if (!isAvailable) {
    // Escalate to warehouse department for manual intervention
    await notifyWarehouseDepartment(orderData, 'insufficient_inventory');
    throw new Error(`Недостаток сырья ${orderData.materialType}. Требуется: ${orderData.volume} кг. Складской отдел уведомлен.`);
  }

  // Calculate price and environmental impact with external API integration
  const priceCalculation = await calculateOrderPrice(orderData);

  // ВАЖНО: явно указываем все обязательные поля для Prisma
  const order = await db.order.create({
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
  } catch (error) {
    // If reservation fails, escalate to warehouse department
    await notifyWarehouseDepartment(orderData, 'reservation_failed');
    
    // Delete the order and re-throw error
    await db.order.delete({ where: { id: order.id } });
    throw new Error(`Не удалось зарезервировать материалы: ${error.message}. Складской отдел уведомлён.`);
  }
  // Получаем данные пользователя для отправки уведомлений
  const user = await db.user.findUnique({ 
    where: { id: auth.userId }
  });

  if (user?.email) {
    // Отправляем уведомления через новую расширенную систему
    const { enhancedNotificationService } = await import('../utils/enhancedNotifications');
    
    try {      // Отправляем уведомление о создании заказа через шаблон
      await enhancedNotificationService.sendNotificationFromTemplate(
        'order-created',
        auth.userId,
        {
          userName: user.name || 'Уважаемый клиент',
          orderId: order.id,
          orderAmount: priceCalculation.totalPrice.toFixed(2)
        },
        {
          userEmail: user.email,
          userPhone: undefined, // Phone field not available in current schema
          orderId: order.id,
          priority: 'medium'
        }
      );

      // Отправляем детальное уведомление о начале обработки заказа
      await enhancedNotificationService.sendNotificationFromTemplate(
        'order-processing-started',
        auth.userId,
        {
          orderId: order.id,
          materialType: orderData.materialType,
          volume: orderData.volume.toString(),
          pickupAddress: orderData.pickupAddress,
          orderAmount: priceCalculation.totalPrice.toFixed(2),
          environmentalImpact: priceCalculation.environmentalImpact.toFixed(2),
          trackingUrl: `${process.env.FRONTEND_URL}/dashboard?tab=orders&order=${order.id}`
        },
        {
          userEmail: user.email,
          userPhone: undefined, // Phone field not available in current schema
          orderId: order.id,
          priority: 'medium'
        }
      );

      console.log(`✅ Уведомления о создании заказа ${order.id} отправлены пользователю ${user.email}`);
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений о создании заказа:', error);
      // Не прерываем создание заказа из-за ошибки уведомлений
    }
  }

  // Fallback старая система (для обратной совместимости)
  try {
    await sendEmail({
      to: user?.email || "customer@example.com",
      subject: `Подтверждение заказа №${order.id}`,
      html: `
        <h1>Ваш заказ принят в обработку</h1>
        <p>Спасибо за ваш заказ. Мы получили запрос на ${orderData.volume} кг ${orderData.materialType}.</p>
        <p>Общая стоимость: ₽${priceCalculation.totalPrice.toFixed(2)}</p>
        <p>Экологический эффект: ${priceCalculation.environmentalImpact.toFixed(2)} кг CO₂ сэкономлено</p>
      `,
    });
  } catch (error) {
    console.error('❌ Ошибка отправки fallback email:', error);
  }
  // Автоматически создаем логистические маршруты для нового заказа
  await createAutomaticLogisticRoutes(order.id, orderData.pickupAddress);

  return order;
}

// Order validation function
async function validateOrderData(orderData: OrderData): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Validate material type
  const validMaterialTypes = ['PET', 'HDPE', 'PP', 'PVC', 'PS', 'PC', 'Other'];
  if (!validMaterialTypes.includes(orderData.materialType)) {
    errors.push('Недопустимый тип сырья');
  }
  
  // Validate volume
  if (orderData.volume <= 0 || orderData.volume > 10000) {
    errors.push('Объём должен быть от 1 до 10000 кг');
  }
  
  // Validate pickup address
  if (!orderData.pickupAddress || orderData.pickupAddress.length < 10) {
    errors.push('Адрес вывоза должен содержать минимум 10 символов');
  }
  
  // Validate address format with external API
  try {
    const addressValidation = await validateAddressWithAPI(orderData.pickupAddress);
    if (!addressValidation.isValid) {
      errors.push('Адрес не найден или указан некорректно');
    }
  } catch (error) {
    console.error('Address validation error:', error);
    errors.push('Не удалось проверить адрес');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate address using external API (Yandex Maps)
async function validateAddressWithAPI(address: string): Promise<{ isValid: boolean; details?: any }> {
  try {
    const { yandexMapsService } = await import('../utils/yandexMaps');
    const result = await yandexMapsService.geocodeAddress(address);
    return {
      isValid: result && result.coordinates && result.coordinates.length === 2,
      details: result
    };
  } catch (error) {
    console.error('Yandex Maps API validation error:', error);
    return { isValid: false };
  }
}

// Notify warehouse department about inventory issues
async function notifyWarehouseDepartment(orderData: OrderData, issueType: string): Promise<void> {
  try {
    // Get warehouse staff
    const warehouseStaff = await getUsersByRole('warehouse');
    
    if (warehouseStaff.length === 0) {
      console.warn('No warehouse staff found for notification');
      return;
    }
    
    const { enhancedNotificationService } = await import('../utils/enhancedNotifications');
    
    for (const staff of warehouseStaff) {
      await enhancedNotificationService.sendNotificationFromTemplate(
        'warehouse-manual-intervention',
        staff.id,
        {
          materialType: orderData.materialType,
          requiredVolume: orderData.volume.toString(),
          issueType: issueType === 'insufficient_inventory' ? 'Недостаток сырья' : 'Проблема резервирования',
          pickupAddress: orderData.pickupAddress,
          warehouseStaffName: staff.name || 'Сотрудник склада',
          dashboardUrl: `${process.env.FRONTEND_URL}/warehouse`
        },
        {
          userEmail: staff.email,
          userPhone: undefined,
          orderId: 'pending',
          priority: 'high'
        }
      );
    }
    
    console.log(`✅ Складской отдел уведомлен о проблеме: ${issueType}`);
  } catch (error) {
    console.error('❌ Ошибка уведомления складского отдела:', error);
  }
}

export async function getUserOrders(authContext?: any): Promise<Order[]> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  const orders = await db.order.findMany({
    where: { userId: auth.userId }
  });

  return orders;
}

export async function getOrderById(input: { id: string }, authContext?: any): Promise<Order> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  const order = await db.order.findUnique({
    where: { id: input.id },
  });

  if (!order) throw new Error("Order not found");
  if (order.userId !== auth.userId) {
    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: auth.userId },
    });
    if (!user?.isAdmin) throw new Error("Not authorized");
  }

  return order;
}

export async function updateOrderStatus(input: { id: string; status: string }): Promise<Order> {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  // Verify admin status
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin) throw new Error("Not authorized");

  const order = await db.order.update({
    where: { id: input.id },
    data: { status: input.status },
  });
    // Получаем данные клиента для отправки уведомлений
  const customer = await db.user.findUnique({ 
    where: { id: order.userId }
  });

  if (customer?.email) {
    try {
      // Отправляем уведомления через новую расширенную систему
      const { enhancedNotificationService } = await import('../utils/enhancedNotifications');
      
      // Определяем подходящий шаблон в зависимости от статуса
      let templateId = 'order-status-changed';
      let variables: Record<string, string> = {
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
      }      // Отправляем уведомление через шаблон
      await enhancedNotificationService.sendNotificationFromTemplate(
        templateId,
        order.userId,
        variables,
        {
          userEmail: customer.email,
          userPhone: undefined, // Phone field not available in current schema
          orderId: order.id,
          priority: input.status === 'cancelled' ? 'high' : 'medium'
        }
      );

      console.log(`✅ Уведомление об изменении статуса заказа ${order.id} отправлено через шаблон ${templateId}`);
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений через новую систему:', error);
    }

    // Fallback старая система для обратной совместимости
    try {
      const { notificationService } = await import('../utils/notifications');
      await notificationService.sendOrderStatusNotification(
        order.id,
        input.status,
        customer.email,
        undefined // Phone field not available
      );
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений через старую систему:', error);
    }

    // Дублируем старую систему email для совместимости
    try {
      await sendEmail({
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
    } catch (error) {
      console.error("❌ Ошибка отправки fallback email:", error);
    }
  }

  console.log(`✅ Статус заказа ${order.id} обновлён на "${input.status}"`);
  return order;
}

// Analytics
export async function getUserAnalytics(authContext?: any): Promise<any> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  const orders = await db.order.findMany({
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
  const materialStats: Record<string, number> = {};
  const statusStats: Record<string, number> = {};
  const monthlyStats: Record<string, { volume: number; earnings: number; co2Saved: number }> = {};
  
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
export async function getAdvancedAnalytics(authContext?: any): Promise<any> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    // Получаем расширенную аналитику из сервиса
    const analytics = await analyticsService.getAdvancedAnalytics(auth);
    return analytics;
  } catch (error) {
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
export async function getAllOrders(authContext?: any): Promise<Order[]> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  // Verify admin status
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin) throw new Error("Not authorized");

  return await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
}

// Financial Reports
export async function getMonthlyFinancialReport(params: {
  month: number;
  year: number;
}, authContext?: any): Promise<FinancialReport> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  // Get all orders for the specified month
  const startDate = new Date(params.year, params.month - 1, 1);
  const endDate = new Date(params.year, params.month, 0, 23, 59, 59);

  const orders = await db.order.findMany({
    where: { userId: auth.userId }
  });

  // Фильтруем заказы по дате на стороне JavaScript
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate totals
  const totalPaid = filteredOrders.reduce((sum: number, order: Order) => sum + order.price, 0);
  const volume = filteredOrders.reduce((sum: number, order: Order) => sum + order.volume, 0);

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

export async function getYearlyFinancialReports(params: {
  year: number;
}, authContext?: any): Promise<FinancialReport[]> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  // Get all orders for the specified year
  const startDate = new Date(params.year, 0, 1);
  const endDate = new Date(params.year, 11, 31, 23, 59, 59);

  const orders = await db.order.findMany({
    where: { userId: auth.userId }
  });

  // Фильтруем заказы по дате на стороне JavaScript
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Group orders by month and calculate totals
  const monthlyReports: { [key: number]: { totalPaid: number; volume: number } } = {};

  // Initialize all months
  for (let month = 1; month <= 12; month++) {
    monthlyReports[month] = { totalPaid: 0, volume: 0 };
  }

  // Add data from orders
  filteredOrders.forEach((order: Order) => {
    const orderDate = new Date(order.createdAt);
    const month = orderDate.getMonth() + 1; // months are 0-indexed in JS
    monthlyReports[month].totalPaid += order.price;
    monthlyReports[month].volume += order.volume;
  });

  // Convert to array of reports
  const reports: FinancialReport[] = [];
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

export async function updatePaymentStatus(paymentData: {
  orderId: string;
  status: string;
}, authContext?: any): Promise<Order> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  // Verify order belongs to user
  const order = await db.order.findUnique({
    where: { id: paymentData.orderId },
  });

  if (!order || order.userId !== auth.userId) {
    throw new Error("Order not found or access denied");
  }

  // Update payment status
  const updatedOrder = await db.order.update({
    where: { id: paymentData.orderId },
    data: { paymentStatus: paymentData.status },
  });

  // If payment is marked as paid, send receipt
  if (paymentData.status === "paid") {
    await sendEmail({
      to: "customer@example.com", // In real app, would be user's email
      subject: `Receipt for Order #${order.id}`,
      html: `
        <h1>Payment Received</h1>
        <p>Thank you for your payment of ₽${order.price.toFixed(2)} for order #${
        order.id
      }.</p>
      `,
    });
  }

  return updatedOrder;
}

// Notification Management
/**
 * Отправка уведомления
 */
export async function sendNotification(input: {
  userId: string;
  type: 'email' | 'sms' | 'push' | 'telegram' | 'whatsapp' | 'in-app';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'order' | 'payment' | 'delivery' | 'system' | 'marketing' | 'analytics';
  scheduledFor?: Date;
}): Promise<{ notificationId: string }> {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  // Проверяем права администратора для системных уведомлений
  if (input.category === 'system' || input.category === 'marketing') {
    const user = await db.user.findUnique({
      where: { id: auth.userId },
    });
    if (!user?.isAdmin) throw new Error("Not authorized");
  }
  // Получаем контактную информацию пользователя
  const contactInfo = await notificationPreferencesService.getUserContactInfo(input.userId);
  const notificationResult = await enhancedNotificationService.queueNotification({
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
export async function sendNotificationFromTemplate(input: {
  templateId: string;
  userId: string;
  variables: Record<string, string>;
  scheduledFor?: Date;
}): Promise<{ notificationId: string }> {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");  const result = await enhancedNotificationService.sendNotificationFromTemplate(
    input.templateId,
    input.userId,
    input.variables
  );

  return { notificationId: result.notificationId };
}

/**
 * Массовая отправка уведомлений
 */
export async function sendBulkNotifications(input: {
  userIds: string[];
  templateId: string;
  variables: Record<string, string>;
}): Promise<{ notificationIds: string[] }> {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  // Проверяем права администратора
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin) throw new Error("Not authorized");
  const result = await enhancedNotificationService.sendBulkNotifications(
    input.userIds,
    input.templateId,
    input.variables
  );

  return { notificationIds: result.notificationIds };
}

/**
 * Получение настроек уведомлений пользователя
 */
export async function getUserNotificationSettings() {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  const settings = await notificationPreferencesService.getUserSettings(auth.userId);
  return settings;
}

/**
 * Обновление настроек уведомлений
 */
export async function updateNotificationPreferences(input: {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  telegram?: boolean;
  whatsapp?: boolean;
  inApp?: boolean;
  categories?: {
    order?: boolean;
    payment?: boolean;
    delivery?: boolean;
    system?: boolean;
    marketing?: boolean;
    analytics?: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  // Convert partial input to proper format with defaults
  const updateData: any = { ...input };
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

  await notificationPreferencesService.updateNotificationPreferences(auth.userId, updateData);
  return { success: true };
}

/**
 * Подключение Telegram
 */
export async function connectTelegram(input: { chatId: string; username?: string }) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  await notificationPreferencesService.connectTelegram(auth.userId, input.chatId, input.username);
  return { success: true };
}

/**
 * Подписка на Web Push уведомления
 */
export async function subscribeWebPush(input: { subscription: any }) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  await notificationPreferencesService.subscribeWebPush(auth.userId, input.subscription);
  return { success: true };
}

/**
 * Отписка от Web Push уведомлений
 */
export async function unsubscribeWebPush(input?: { endpoint: string }) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  await notificationPreferencesService.unsubscribeWebPush(auth.userId, input?.endpoint);
  return { success: true };
}

/**
 * Верификация email
 */
export async function verifyNotificationEmail(input: { email: string }) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  await notificationPreferencesService.verifyEmail(auth.userId, input.email);
  return { success: true };
}

/**
 * Верификация телефона
 */
export async function verifyNotificationPhone(input: { phoneNumber: string }) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");

  await notificationPreferencesService.verifyPhone(auth.userId, input.phoneNumber);
  return { success: true };
}

/**
 * Получение истории уведомлений
 */
export async function getNotificationHistory(options?: { page?: number; limit?: number; status?: string; type?: string; userId?: string; }) {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  const historyOptions = options || {};
  const history = await enhancedNotificationService.getNotificationHistory({
    userId: auth.userId,
    ...historyOptions
  });
  return history;
}

/**
 * Получение статистики уведомлений
 */
export async function getNotificationStats() {
  const auth = await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  const stats = await enhancedNotificationService.getNotificationStats(auth.userId);
  return stats;
}

/**
 * Отписка от всех уведомлений по токену
 */
export async function unsubscribeByToken(input: { token: string }) {
  const success = await notificationPreferencesService.unsubscribeByToken(input.token);
  return { success };
}

// Helper type for accumulated analytics
interface AnalyticsAccumulator {
  totalOrders: number;
  totalEarnings: number;
  totalEnvironmentalImpact: number;
  recycledByMaterial: Record<string, number>;
  ordersByStatus: Record<string, number>;
  monthlyEarnings: number[];
  yearlyVolume: Record<number, number>;
}

// Get all customers for admin/manager users
export async function getAllCustomers(authContext?: any): Promise<any[]> {
  const auth = authContext || await getAuth();
  if (!auth.userId) {
    throw new Error("Not authenticated");
  }

  // Verify admin/manager status
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  
  if (!user?.isAdmin && user?.role !== 'manager') {
    throw new Error("Not authorized - admin or manager privileges required");
  }
  try {
    // Get all users with their order statistics
    const users = await db.user.findMany({
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
    const allOrders = await db.order.findMany({
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
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers data');
  }
}

// Warehouse Management API Methods
export async function getInventoryItems(authContext?: any): Promise<InventoryItem[]> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  
  // Verify warehouse manager or admin role
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin && user?.role !== 'manager') {
    throw new Error("Warehouse access required");
  }

  return await db.inventoryItem.findMany({
    orderBy: { materialType: 'asc' }
  });
}

export async function updateInventoryItem(input: {
  id: string;
  availableQuantity?: number;
  reservedQuantity?: number;
  minThreshold?: number;
  maxCapacity?: number;
  location?: string;
}, authContext?: any): Promise<InventoryItem> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin && user?.role !== 'manager') {
    throw new Error("Warehouse access required");
  }

  return await db.inventoryItem.update({
    where: { id: input.id },
    data: {
      ...input,
      lastUpdated: new Date()
    }
  });
}

export async function createInventoryItem(input: {
  materialType: string;
  availableQuantity: number;
  location: string;
  minThreshold: number;
  maxCapacity: number;
}, authContext?: any): Promise<InventoryItem> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin && user?.role !== 'manager') {
    throw new Error("Warehouse access required");
  }

  return await db.inventoryItem.create({
    data: {
      ...input,
      reservedQuantity: 0,
      lastUpdated: new Date()
    }
  });
}

export async function checkInventoryAvailability(materialType: string, requiredQuantity: number): Promise<boolean> {
  const inventory = await db.inventoryItem.findFirst({
    where: { materialType }
  });
  
  if (!inventory) return false;
  
  const availableForOrder = inventory.availableQuantity - inventory.reservedQuantity;
  return availableForOrder >= requiredQuantity;
}

export async function reserveMaterial(input: {
  materialType: string;
  quantity: number;
  orderId: string;
}): Promise<InventoryItem> {
  const inventory = await db.inventoryItem.findFirst({
    where: { materialType: input.materialType }
  });
  
  if (!inventory) {
    throw new Error(`Material ${input.materialType} not found in inventory`);
  }
  
  const availableForOrder = inventory.availableQuantity - inventory.reservedQuantity;
  if (availableForOrder < input.quantity) {
    throw new Error(`Insufficient inventory. Available: ${availableForOrder}, Required: ${input.quantity}`);
  }

  return await db.inventoryItem.update({
    where: { id: inventory.id },
    data: {
      reservedQuantity: inventory.reservedQuantity + input.quantity,
      lastUpdated: new Date()
    }
  });
}

// Logistics Route Management API Methods
export async function getLogisticRoutes(authContext?: any): Promise<LogisticRoute[]> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin && user?.role !== 'logistic') {
    throw new Error("Logistics access required");
  }

  return await db.logisticRoute.findMany({
    include: {
      routeOptions: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createLogisticRoute(input: {
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDistance: number;
  routeOptions: {
    name: string;
    estimatedCost: number;
    estimatedTime: number;
    transportType: string;
    description?: string;
  }[];
}, authContext?: any): Promise<LogisticRoute> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin && user?.role !== 'logistic') {
    throw new Error("Logistics access required");
  }

  return await db.logisticRoute.create({
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

export async function selectRoute(input: {
  routeId: string;
  selectedOptionId: string;
}, authContext?: any): Promise<LogisticRoute> {
  const auth = authContext || await getAuth();
  if (auth.status !== "authenticated") throw new Error("Not authenticated");
  
  const user = await db.user.findUnique({
    where: { id: auth.userId },
  });
  if (!user?.isAdmin && user?.role !== 'logistic') {
    throw new Error("Logistics access required");
  }

  // Update route status and selected option
  await db.routeOption.updateMany({
    where: { logisticRouteId: input.routeId },
    data: { isSelected: false }
  });

  await db.routeOption.update({
    where: { id: input.selectedOptionId },
    data: { isSelected: true }
  });

  const updatedRoute = await db.logisticRoute.update({
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
  const updatedOrder = await db.order.update({
    where: { id: updatedRoute.orderId },
    data: { status: 'accepted' }
  });

  // Получаем клиента для отправки уведомлений
  const customer = await db.user.findUnique({
    where: { id: updatedOrder.userId }
  });

  // Отправляем уведомление клиенту о том, что логист выбрал маршрут
  if (customer) {
    try {
      // Получаем выбранный вариант маршрута
      const selectedOption = updatedRoute.routeOptions.find(opt => opt.isSelected);
      
      await enhancedNotificationService.sendNotificationFromTemplate(
        'order-route-selected',
        customer.id,
        {
          orderId: updatedOrder.id,
          customerName: customer.name || 'Уважаемый клиент',
          routeName: selectedOption?.name || 'Стандартный маршрут',
          estimatedDeliveryTime: selectedOption?.estimatedTime?.toString() || 'в ближайшее время',
          transportType: selectedOption?.transportType || 'Грузовой транспорт',
          trackingUrl: `${process.env.FRONTEND_URL}/dashboard?tab=orders&order=${updatedOrder.id}`
        },
        {
          userEmail: customer.email,
          userPhone: undefined,
          orderId: updatedOrder.id,
          priority: 'high'
        }
      );
      
      console.log(`✅ Уведомление об обновлении статуса заказа ${updatedOrder.id} отправлено клиенту ${customer.email}`);
    } catch (error) {
      console.error(`❌ Ошибка отправки уведомления клиенту ${customer?.email || 'unknown'}:`, error);
    }
  }

  // Generate order documentation
  await generateOrderDocumentation(updatedRoute.orderId);
  return updatedRoute;
}

// Helper function to automatically create logistic routes for new orders
export async function createAutomaticLogisticRoutes(orderId: string, pickupAddress: string): Promise<void> {
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
    const logisticRoute = await db.logisticRoute.create({
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
        await enhancedNotificationService.sendNotificationFromTemplate(
          'new-order-for-logistics',
          logist.id,
          {
            orderId,
            pickupAddress,
            logistName: logist.name || 'Уважаемый логист',
            routeOptionsCount: routeOptions.length.toString(),
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard?tab=logistics&order=${orderId}`
          },
          {
            userEmail: logist.email,
            userPhone: undefined,
            orderId,
            priority: 'high'
          }
        );
        
        console.log(`✅ Уведомление о новом заказе ${orderId} отправлено логисту ${logist.email}`);
      } catch (error) {
        console.error(`❌ Ошибка отправки уведомления логисту ${logist.email}:`, error);
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка создания автоматических логистических маршрутов для заказа ${orderId}:`, error);
  }
}

// Document Generation - Enhanced contract generation
export async function generateOrderDocumentation(orderId: string): Promise<OrderDocument> {
  const order = await db.order.findUnique({
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

  // Generate comprehensive contract document
  const contractData = await generateContractData(order, selectedRoute, selectedOption);

  const documentData = {
    orderId: order.id,
    documentType: 'DELIVERY_CONTRACT' as const,
    generatedAt: new Date(),
    customerInfo: {
      name: order.user.name,
      email: order.user.email,
      company: order.user.companyName || 'Частное лицо',
      inn: order.user.inn || 'Не указан',
      kpp: order.user.kpp || 'Не указан',
      address: order.pickupAddress,
      billingAddress: order.user.billingAddress || order.pickupAddress
    },
    orderDetails: {
      materialType: order.materialType,
      volume: order.volume,
      price: order.price,
      environmentalImpact: order.environmentalImpact,
      contractNumber: generateContractNumber(order.id),
      contractDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      terms: contractData.terms,
      specifications: contractData.specifications
    },
    logisticsInfo: selectedOption ? {
      routeName: selectedOption.name,
      transportType: selectedOption.transportType,
      estimatedCost: selectedOption.estimatedCost,
      estimatedTime: selectedOption.estimatedTime,
      distance: selectedRoute.estimatedDistance,
      deliveryTerms: contractData.deliveryTerms
    } : null,
    status: 'generated' as const
  };

  const document = await db.orderDocument.create({
    data: documentData
  });

  // Notify client that contract is ready
  await notifyClientContractReady(order.user, order.id, document.id);

  return document;
}

// Generate contract data with terms and conditions
async function generateContractData(order: any, route: any, option: any) {
  return {
    terms: {
      payment: 'Оплата в течение 7 дней с момента подписания договора',
      delivery: 'Доставка осуществляется в течение 5 рабочих дней',
      quality: 'Материал должен соответствовать ГОСТ 30340-2013',
      liability: 'Стороны несут ответственность согласно действующему законодательству РФ',
      warranty: 'Гарантия качества переработки - 1 год'
    },
    specifications: {
      materialGrade: getMaterialGrade(order.materialType),
      processingMethod: getProcessingMethod(order.materialType),
      environmentalCertification: 'ISO 14001:2015',
      recyclingEfficiency: '95%'
    },
    deliveryTerms: route ? {
      pickupSchedule: 'По согласованию с клиентом',
      transportInsurance: 'Включена в стоимость',
      handlingInstructions: 'Бережная погрузка и транспортировка'
    } : null
  };
}

// Generate unique contract number
function generateContractNumber(orderId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const orderShort = orderId.substring(0, 8).toUpperCase();
  return `ДОГ-${year}${month}-${orderShort}`;
}

// Get material grade specifications
function getMaterialGrade(materialType: string): string {
  const grades = {
    'PET': 'ПЭТ-1 (пищевой)',
    'HDPE': 'ПВД высокой плотности',
    'PP': 'ПП техническое применение',
    'PVC': 'ПВХ строительное применение',
    'PS': 'ПС общего назначения',
    'PC': 'ПК оптическое качество'
  };
  return grades[materialType] || 'Стандартный сорт';
}

// Get processing method
function getProcessingMethod(materialType: string): string {
  const methods = {
    'PET': 'Химическая переработка + гранулирование',
    'HDPE': 'Механическая переработка + экструзия',
    'PP': 'Термическая переработка + литьё',
    'PVC': 'Измельчение + повторная формовка',
    'PS': 'Растворение + очистка + гранулирование',
    'PC': 'Деполимеризация + ресинтез'
  };
  return methods[materialType] || 'Стандартная переработка';
}

// Notify client that contract is ready
async function notifyClientContractReady(user: any, orderId: string, documentId: string): Promise<void> {
  try {
    const { enhancedNotificationService } = await import('../utils/enhancedNotifications');
    
    await enhancedNotificationService.sendNotificationFromTemplate(
      'contract-ready',
      user.id,
      {
        customerName: user.name || 'Уважаемый клиент',
        orderId: orderId,
        contractNumber: generateContractNumber(orderId),
        downloadUrl: `${process.env.FRONTEND_URL}/documents/${documentId}`,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard?tab=orders&order=${orderId}`
      },
      {
        userEmail: user.email,
        userPhone: undefined,
        orderId: orderId,
        priority: 'medium'
      }
    );
    
    console.log(`✅ Клиент ${user.email} уведомлен о готовности договора для заказа ${orderId}`);
  } catch (error) {
    console.error('❌ Ошибка уведомления клиента о готовности договора:', error);
  }
}

export async function getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
  return await db.orderDocument.findMany({
    where: { orderId },
    orderBy: { generatedAt: 'desc' }
  });
}