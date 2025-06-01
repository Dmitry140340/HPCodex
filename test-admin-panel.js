/**
 * Тестирование административной панели HimkaPlastic EcoTrack
 * Проверка основных функций и интеграции
 */

console.log('=== ТЕСТИРОВАНИЕ АДМИНИСТРАТИВНОЙ ПАНЕЛИ ===');

// Функция для тестирования API
async function testAdminAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  // Данные для авторизации администратора (если есть тестовый аккаунт)
  const adminCredentials = {
    email: 'admin@himkaplastic.ru',
    password: 'admin123'
  };

  try {
    console.log('\n1. Тестирование авторизации администратора...');
    
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminCredentials)
    });

    if (!loginResponse.ok) {
      console.log('❌ Администратор не найден или неверные данные');
      console.log('ℹ️  Создайте администратора через регистрацию с ролью admin');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Авторизация администратора успешна');
    console.log(`Token: ${token.substring(0, 20)}...`);

    // Тестирование административных функций
    console.log('\n2. Тестирование административной аналитики...');
    
    const analyticsResponse = await fetch(`${baseURL}/admin/analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      console.log('✅ Административная аналитика работает');
      console.log(`Общее количество заказов: ${analytics.totalOrders || 0}`);
      console.log(`Активных пользователей: ${analytics.activeUsers || 0}`);
    } else {
      console.log('❌ Ошибка получения административной аналитики');
    }

    console.log('\n3. Тестирование управления пользователями...');
    
    const usersResponse = await fetch(`${baseURL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Получение списка пользователей работает');
      console.log(`Всего пользователей: ${users.length}`);
      
      if (users.length > 0) {
        console.log('Пользователи:');
        users.slice(0, 3).forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name} (${user.email}) - роль: ${user.role}`);
        });
      }
    } else {
      console.log('❌ Ошибка получения списка пользователей');
    }

    console.log('\n4. Тестирование управления KPI...');
    
    const kpiResponse = await fetch(`${baseURL}/admin/kpi`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (kpiResponse.ok) {
      const kpi = await kpiResponse.json();
      console.log('✅ KPI показатели получены');
      console.log(`KPI метрик: ${Object.keys(kpi).length}`);
    } else {
      console.log('❌ Ошибка получения KPI показателей');
    }

    console.log('\n=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    console.log('\nПроверьте:');
    console.log('1. Запущен ли бэкенд сервер на порту 3001');
    console.log('2. Создан ли пользователь с ролью admin');
    console.log('3. Доступны ли административные роуты');
  }
}

// Функция для проверки статуса сервера
async function checkServerStatus() {
  console.log('\n=== ПРОВЕРКА СТАТУСА СЕРВЕРОВ ===');
  
  try {
    console.log('Проверка бэкенд сервера...');
    const backendResponse = await fetch('http://localhost:3001/api/status');
    
    if (backendResponse.ok) {
      console.log('✅ Бэкенд сервер работает (порт 3001)');
    } else {
      console.log('⚠️  Бэкенд сервер отвечает, но есть проблемы');
    }
  } catch (error) {
    console.log('❌ Бэкенд сервер недоступен (порт 3001)');
  }

  try {
    console.log('Проверка фронтенд сервера...');
    const frontendResponse = await fetch('http://localhost:3000');
    
    if (frontendResponse.ok) {
      console.log('✅ Фронтенд сервер работает (порт 3000)');
    } else {
      console.log('⚠️  Фронтенд сервер отвечает, но есть проблемы');
    }
  } catch (error) {
    console.log('❌ Фронтенд сервер недоступен (порт 3000)');
  }
}

// Список новых функций для тестирования
function listNewFeatures() {
  console.log('\n=== НОВЫЕ ФУНКЦИИ ДЛЛ ТЕСТИРОВАНИЯ ===');
  console.log('1. 🔧 Административная панель (/admin)');
  console.log('   - Управление KPI и показателями');
  console.log('   - Аналитика по всем пользователям');
  console.log('   - Управление пользователями и ролями');
  console.log('   - Настройки ценообразования');
  console.log('   - Системные настройки');
  
  console.log('\n2. 📊 Дашборд аналитики (/dashboard?tab=analytics)');
  console.log('   - График объемов переработки');
  console.log('   - Экологический эффект');
  console.log('   - Распределение материалов');
  console.log('   - Статусы заказов');
  
  console.log('\n3. 🔔 Система уведомлений');
  console.log('   - Email уведомления');
  console.log('   - SMS уведомления');
  console.log('   - Push уведомления в браузере');
  
  console.log('\n4. 💰 Обновленное ценообразование');
  console.log('   - Интеграция с биржами вторсырья');
  console.log('   - Динамические цены на материалы');
  console.log('   - Обновленная формула расчета (L_d = 70 руб/км)');
  
  console.log('\n5. 📋 Новые статусы заказов');
  console.log('   - "processing" (Обработка)');
  console.log('   - "delivery" (Доставка)');
  console.log('   - "cancelled" (Отменён)');
  
  console.log('\n=== ДЛЯ ТЕСТИРОВАНИЯ ВЫПОЛНИТЕ ===');
  console.log('1. Зарегистрируйтесь как администратор');
  console.log('2. Откройте /admin для управления системой');
  console.log('3. Перейдите в /dashboard?tab=analytics для просмотра графиков');
  console.log('4. Создайте тестовые заказы и проверьте уведомления');
  console.log('5. Проверьте обновленное ценообразование при создании заказа');
}

// Запуск тестирования
async function runTests() {
  listNewFeatures();
  await checkServerStatus();
  
  // Небольшая задержка перед тестированием API
  setTimeout(async () => {
    await testAdminAPI();
  }, 2000);
}

// Запускаем тесты
runTests();
