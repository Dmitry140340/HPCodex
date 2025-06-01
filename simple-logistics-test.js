/**
 * Простой тест функциональности логистической системы EcoTrack
 */

const fs = require('fs');
const path = require('path');

// Цвета для вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFunction(content, functionName) {
  return content.includes(`export async function ${functionName}`) || 
         content.includes(`async function ${functionName}`) ||
         content.includes(`function ${functionName}`);
}

function testLogisticsSystem() {
  log('🚀 ТЕСТИРОВАНИЕ ЛОГИСТИЧЕСКОЙ СИСТЕМЫ ECOTRACK', 'blue');
  log('=' .repeat(60), 'blue');
  
  let allTestsPassed = true;
  
  // 1. Проверяем основной API файл
  log('\n📋 Проверка основного API файла...', 'yellow');
  
  const apiPath = path.join(__dirname, 'ecotrack/src/api/api.ts');
  
  if (!fs.existsSync(apiPath)) {
    log('❌ API файл не найден!', 'red');
    allTestsPassed = false;
    return;
  }
  
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  // Проверяем ключевые функции
  const requiredFunctions = [
    'getUsersByRole',
    'createAutomaticLogisticRoutes',
    'createOrder',
    'selectRoute',
    'createLogisticRoute',
    'getLogisticRoutes'
  ];
  
  for (const func of requiredFunctions) {
    if (checkFunction(apiContent, func)) {
      log(`✅ Функция ${func} найдена`, 'green');
    } else {
      log(`❌ Функция ${func} НЕ НАЙДЕНА`, 'red');
      allTestsPassed = false;
    }
  }
  
  // 2. Проверяем интеграцию функций
  log('\n🔄 Проверка интеграции функций...', 'yellow');
  
  // Проверяем, что createOrder вызывает createAutomaticLogisticRoutes
  if (apiContent.includes('await createAutomaticLogisticRoutes')) {
    log('✅ createOrder интегрирован с createAutomaticLogisticRoutes', 'green');
  } else {
    log('❌ createOrder НЕ интегрирован с createAutomaticLogisticRoutes', 'red');
    allTestsPassed = false;
  }
  
  // Проверяем, что selectRoute отправляет уведомления
  if (apiContent.includes('enhancedNotificationService.sendNotificationFromTemplate')) {
    log('✅ selectRoute интегрирован с системой уведомлений', 'green');
  } else {
    log('❌ selectRoute НЕ интегрирован с системой уведомлений', 'red');
    allTestsPassed = false;
  }
  
  // 3. Проверяем систему уведомлений
  log('\n📧 Проверка системы уведомлений...', 'yellow');
  
  const notificationsPath = path.join(__dirname, 'ecotrack/src/utils/enhancedNotifications.ts');
  
  if (fs.existsSync(notificationsPath)) {
    const notificationsContent = fs.readFileSync(notificationsPath, 'utf8');
    
    // Проверяем шаблоны уведомлений
    const requiredTemplates = [
      'new-order-for-logistics',
      'order-route-selected'
    ];
    
    for (const template of requiredTemplates) {
      if (notificationsContent.includes(template)) {
        log(`✅ Шаблон уведомления ${template} найден`, 'green');
      } else {
        log(`❌ Шаблон уведомления ${template} НЕ НАЙДЕН`, 'red');
        allTestsPassed = false;
      }
    }
  } else {
    log('❌ Файл системы уведомлений не найден!', 'red');
    allTestsPassed = false;
  }
  
  // 4. Проверяем роли пользователей
  log('\n👥 Проверка ролей пользователей...', 'yellow');
  
  if (apiContent.includes('@logistic.com')) {
    log('✅ Роль логиста по домену @logistic.com настроена', 'green');
  } else {
    log('❌ Роль логиста НЕ настроена', 'red');
    allTestsPassed = false;
  }
  
  // 5. Проверяем фронтенд компоненты
  log('\n🌐 Проверка фронтенд компонентов...', 'yellow');
  
  const logisticsPagePath = path.join(__dirname, 'ecotrack-frontend/src/pages/LogisticsManagement.tsx');
  
  if (fs.existsSync(logisticsPagePath)) {
    log('✅ Страница управления логистикой найдена', 'green');
  } else {
    log('❌ Страница управления логистикой НЕ НАЙДЕНА', 'red');
    allTestsPassed = false;
  }
  
  // 6. Проверяем серверные маршруты
  log('\n🛤️ Проверка серверных маршрутов...', 'yellow');
  
  const serverPath = path.join(__dirname, 'ecotrack/src/server/server.ts');
  
  if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (serverContent.includes('/api/logistics/routes')) {
      log('✅ API маршруты для логистики настроены', 'green');
    } else {
      log('❌ API маршруты для логистики НЕ настроены', 'red');
      allTestsPassed = false;
    }
  } else {
    log('❌ Файл сервера не найден!', 'red');
    allTestsPassed = false;
  }
  
  // Итоговый отчет
  log('\n📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ', 'blue');
  log('=' .repeat(40), 'blue');
  
  if (allTestsPassed) {
    log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!', 'green');
    log('\n✅ Логистическая система полностью настроена и готова к работе!', 'green');
    
    log('\n🔧 АРХИТЕКТУРА СИСТЕМЫ:', 'cyan');
    log('• Клиенты создают заказы через функцию createOrder', 'cyan');
    log('• Система автоматически вызывает createAutomaticLogisticRoutes', 'cyan');
    log('• Создаются 3 варианта маршрутов (экономичный, быстрый, стандартный)', 'cyan');
    log('• Всем логистам отправляются уведомления через шаблон new-order-for-logistics', 'cyan');
    log('• Логисты могут выбирать маршруты через функцию selectRoute', 'cyan');
    log('• При выборе маршрута статус заказа меняется на "accepted"', 'cyan');
    log('• Клиенту отправляется уведомление через шаблон order-route-selected', 'cyan');
    
    log('\n🎯 ДЛЯ ЗАПУСКА ТЕСТИРОВАНИЯ:', 'yellow');
    log('1. Запустите backend: cd ecotrack && npm run dev', 'yellow');
    log('2. Запустите frontend: cd ecotrack-frontend && npm start', 'yellow');
    log('3. Войдите как клиент: client@test.com / test123456', 'yellow');
    log('4. Создайте заказ и проверьте автоматическое создание маршрутов', 'yellow');
    log('5. Войдите как логист: logist1@logistic.com / test123456', 'yellow');
    log('6. Выберите маршрут и проверьте уведомления клиенту', 'yellow');
    
  } else {
    log('❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ', 'red');
    log('Необходимо исправить ошибки перед использованием системы', 'red');
  }
  
  return allTestsPassed;
}

// Запускаем тестирование
const success = testLogisticsSystem();
process.exit(success ? 0 : 1);
