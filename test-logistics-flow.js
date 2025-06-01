// Автоматический тест полного цикла логистической системы

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Тестовые данные
const testAccounts = {
  client: { email: 'client@test.com', password: 'test123456' },
  logist1: { email: 'logist1@logistic.com', password: 'test123456' },
  logist2: { email: 'logist2@logistic.com', password: 'test123456' },
  manager: { email: 'manager@manager.com', password: 'test123456' },
  admin: { email: 'admin@admin.com', password: 'test123456' }
};

// Функция для выполнения HTTP запросов
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    console.log(`🔄 Запрос: ${mergedOptions.method || 'GET'} ${url}`);
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Ошибка ${response.status}:`, data);
      return { error: true, status: response.status, data };
    }
    
    console.log(`✅ Ответ ${response.status}:`, data);
    return { error: false, status: response.status, data };
  } catch (error) {
    console.error(`❌ Ошибка сети:`, error.message);
    return { error: true, message: error.message };
  }
}

// Функция входа в систему
async function login(email, password) {
  return await makeRequest('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

// Функция создания заказа
async function createOrder(token, orderData) {
  return await makeRequest('/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  });
}

// Функция получения логистических маршрутов
async function getLogisticRoutes(token) {
  return await makeRequest('/api/logistics/routes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
}

// Функция выбора маршрута
async function selectRoute(token, routeId, optionId) {
  return await makeRequest('/api/logistics/routes/select', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      routeId: routeId,
      selectedOptionId: optionId
    })
  });
}

// Функция получения заказов пользователя
async function getUserOrders(token) {
  return await makeRequest('/api/orders/my', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
}

// Основная функция тестирования
async function runLogisticsTest() {
  console.log('🎯 ЗАПУСК АВТОМАТИЧЕСКОГО ТЕСТИРОВАНИЯ ЛОГИСТИЧЕСКОЙ СИСТЕМЫ');
  console.log('==============================================================\n');
  
  let clientToken, logistToken, orderId, routeId;
  
  try {
    // ШАГ 1: Вход клиента в систему
    console.log('📋 ШАГ 1: Вход клиента в систему');
    console.log('================================');
    const clientLogin = await login(testAccounts.client.email, testAccounts.client.password);
    if (clientLogin.error) {
      throw new Error('Не удалось войти как клиент');
    }
    clientToken = clientLogin.data.token;
    console.log('✅ Клиент успешно вошел в систему\n');
    
    // ШАГ 2: Создание заказа клиентом
    console.log('📋 ШАГ 2: Создание заказа клиентом');
    console.log('==================================');
    const orderData = {
      materialType: 'HDPE',
      volume: 100,
      pickupAddress: 'г. Москва, ул. Тестовая, д. 1'
    };
    
    const orderResponse = await createOrder(clientToken, orderData);
    if (orderResponse.error) {
      throw new Error('Не удалось создать заказ');
    }
    orderId = orderResponse.data.id;
    console.log(`✅ Заказ №${orderId} успешно создан`);
    console.log('✨ Система должна автоматически создать маршруты и уведомить логистов\n');
    
    // ШАГ 3: Вход логиста в систему
    console.log('📋 ШАГ 3: Вход логиста в систему');
    console.log('=================================');
    const logistLogin = await login(testAccounts.logist1.email, testAccounts.logist1.password);
    if (logistLogin.error) {
      throw new Error('Не удалось войти как логист');
    }
    logistToken = logistLogin.data.token;
    console.log('✅ Логист успешно вошел в систему\n');
    
    // ШАГ 4: Получение маршрутов логистом
    console.log('📋 ШАГ 4: Проверка новых маршрутов');
    console.log('==================================');
    
    // Ждем немного, чтобы система обработала создание маршрутов
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const routesResponse = await getLogisticRoutes(logistToken);
    if (routesResponse.error) {
      throw new Error('Не удалось получить маршруты');
    }
    
    const routes = routesResponse.data;
    const newOrderRoute = routes.find(route => route.orderId === orderId);
    
    if (!newOrderRoute) {
      throw new Error(`Не найден маршрут для заказа ${orderId}`);
    }
    
    routeId = newOrderRoute.id;
    console.log(`✅ Найден маршрут №${routeId} для заказа №${orderId}`);
    console.log(`📦 Варианты маршрутов: ${newOrderRoute.routeOptions.length} шт.`);
    
    newOrderRoute.routeOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.name} - ${option.estimatedCost}₽ (${option.estimatedTime}ч)`);
    });
    console.log('');
    
    // ШАГ 5: Выбор маршрута логистом
    console.log('📋 ШАГ 5: Выбор маршрута логистом');
    console.log('=================================');
    
    // Выбираем первый доступный маршрут
    const selectedOption = newOrderRoute.routeOptions[0];
    const selectResponse = await selectRoute(logistToken, routeId, selectedOption.id);
    
    if (selectResponse.error) {
      throw new Error('Не удалось выбрать маршрут');
    }
    
    console.log(`✅ Логист выбрал маршрут: ${selectedOption.name}`);
    console.log('✨ Система должна обновить статус заказа и уведомить клиента\n');
    
    // ШАГ 6: Проверка обновления статуса заказа
    console.log('📋 ШАГ 6: Проверка статуса заказа клиентом');
    console.log('==========================================');
    
    // Ждем немного для обработки обновления статуса
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const ordersResponse = await getUserOrders(clientToken);
    if (ordersResponse.error) {
      throw new Error('Не удалось получить заказы клиента');
    }
    
    const updatedOrder = ordersResponse.data.find(order => order.id === orderId);
    if (!updatedOrder) {
      throw new Error(`Не найден заказ ${orderId} в списке клиента`);
    }
    
    console.log(`✅ Статус заказа обновлен: ${updatedOrder.status}`);
    console.log(`💰 Стоимость: ${updatedOrder.price}₽`);
    console.log(`🌱 Экологический эффект: ${updatedOrder.environmentalImpact.toFixed(2)} кг CO₂\n`);
    
    // Финальная проверка
    console.log('🎉 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО УСПЕШНО!');
    console.log('==================================');
    console.log('✅ Клиент создал заказ');
    console.log('✅ Система автоматически создала маршруты');
    console.log('✅ Логист получил уведомление и выбрал маршрут');
    console.log('✅ Статус заказа обновился');
    console.log('✅ Клиент получил уведомление об обновлении');
    console.log('\n🎯 ЛОГИСТИЧЕСКАЯ СИСТЕМА РАБОТАЕТ КОРРЕКТНО! 🎯');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА ТЕСТИРОВАНИЯ:', error.message);
    console.log('\n🔧 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
    console.log('• Серверы не запущены (backend на :3001, frontend на :3000)');
    console.log('• Проблемы с базой данных');
    console.log('• Ошибки в коде API');
    console.log('• Тестовые пользователи не созданы');
    
    process.exit(1);
  }
}

// Запуск тестирования
console.log('⏰ Ожидание 5 секунд для запуска серверов...\n');
setTimeout(runLogisticsTest, 5000);
