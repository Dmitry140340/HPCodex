import * as api from './ecotrack/src/api/api';
import { db } from './ecotrack/src/server/db';

async function runScenario() {
  const client = await db.user.findFirst({ where: { role: 'client' } });
  const logistic = await db.user.findFirst({ where: { role: 'logistic' } });

  if (!client || !logistic) {
    console.log('Не найдены тестовые пользователи. Запустите setup-all-user-roles.js');
    return;
  }

  const authClient = { userId: client.id, status: 'authenticated', role: 'client' } as any;
  const authLogistic = { userId: logistic.id, status: 'authenticated', role: 'logistic' } as any;

  const materialType = 'PET';
  const volume = 200;
  const pickupAddress = 'Москва, ул. Тестовая, 1';

  const available = await api.checkInventoryAvailability(materialType, volume);
  if (!available) {
    console.log('❌ Недостаточно сырья. Клиент получает push-уведомление.');
    return;
  }

  const order = await api.createOrder({ materialType, volume, pickupAddress }, authClient);
  console.log('✅ Заказ создан:', order.id);

  const routes = await api.getLogisticRoutes(authLogistic);
  const myRoute = routes.find(r => r.orderId === order.id);
  if (!myRoute) {
    console.log('Маршрут для заказа не найден');
    return;
  }

  const option = myRoute.routeOptions[0];
  await api.selectRoute({ routeId: myRoute.id, selectedOptionId: option.id }, authLogistic);
  console.log('✅ Логист выбрал маршрут:', option.name);

  const updatedOrder = await api.getOrderById({ id: order.id }, authClient);
  console.log('Статус заказа для клиента:', updatedOrder.status);
}

runScenario().then(() => db.$disconnect());
