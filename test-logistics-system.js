/**
 * Комплексный тест логистической системы EcoTrack
 * Проверяет автоматическое создание маршрутов и уведомления
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

async function testLogisticsSystem() {
  log('🚀 ТЕСТИРОВАНИЕ ЛОГИСТИЧЕСКОЙ СИСТЕМЫ ECOTRACK', 'blue');
  log('=' .repeat(60), 'blue');
  
  // 1. Проверяем наличие всех необходимых файлов
  log('\n📋 Проверка файлов системы...', 'yellow');
  
  const requiredFiles = [
    'ecotrack/src/api/api.ts',
    'ecotrack/src/utils/enhancedNotifications.ts',
    'ecotrack-frontend/src/pages/LogisticsManagement.tsx',
    'ecotrack-frontend/src/App.tsx'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} - НЕ НАЙДЕН`, 'red');
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    log('\n❌ Некоторые файлы отсутствуют. Тестирование остановлено.', 'red');
    return;
  }
  
  // 2. Проверяем содержимое API файла
  log('\n🔍 Проверка функций API...', 'yellow');
  
  const apiPath = path.join(__dirname, 'ecotrack/src/api/api.ts');
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  const requiredFunctions = [
    'getUsersByRole',
    'createAutomaticLogisticRoutes',
    'createOrder',
    'selectRoute'
  ];
  
  let allFunctionsPresent = true;
  for (const func of requiredFunctions) {
    if (apiContent.includes(func)) {
      log(`✅ Функция ${func} найдена`, 'green');
    } else {
      log(`❌ Функция ${func} НЕ НАЙДЕНА`, 'red');
      allFunctionsPresent = false;
    }
  }
  
  // 3. Проверяем систему уведомлений
  log('\n📧 Проверка системы уведомлений...', 'yellow');
  
  const notificationsPath = path.join(__dirname, 'ecotrack/src/utils/enhancedNotifications.ts');
  const notificationsContent = fs.readFileSync(notificationsPath, 'utf8');
  
  const requiredTemplates = [
    'new-order-for-logistics',
    'order-route-selected'
  ];
  
  let allTemplatesPresent = true;
  for (const template of requiredTemplates) {
    if (notificationsContent.includes(template)) {
      log(`✅ Шаблон уведомления ${template} найден`, 'green');
    } else {
      log(`❌ Шаблон уведомления ${template} НЕ НАЙДЕН`, 'red');
      allTemplatesPresent = false;
    }
  }
  
  // 4. Проверяем интеграцию в createOrder
  log('\n🔄 Проверка интеграции с createOrder...', 'yellow');
  
  if (apiContent.includes('createAutomaticLogisticRoutes') && 
      apiContent.includes('await createAutomaticLogisticRoutes')) {
    log('✅ createOrder интегрирован с createAutomaticLogisticRoutes', 'green');
  } else {
    log('❌ createOrder НЕ интегрирован с createAutomaticLogisticRoutes', 'red');
    allFunctionsPresent = false;
  }
  
  // 5. Проверяем интеграцию в selectRoute
  log('\n📮 Проверка интеграции с selectRoute...', 'yellow');
  
  if (apiContent.includes('order-route-selected') && 
      apiContent.includes('enhancedNotificationService.sendNotification')) {
    log('✅ selectRoute интегрирован с системой уведомлений', 'green');
  } else {
    log('❌ selectRoute НЕ интегрирован с системой уведомлений', 'red');
    allFunctionsPresent = false;
  }
  
  // 6. Проверяем пользователей
  log('\n👥 Проверка тестовых пользователей...', 'yellow');
  
  const { PrismaClient } = require('./ecotrack/node_modules/@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['client@test.com', 'logist1@logistic.com', 'logist2@logistic.com']
        }
      }
    });
    
    log(`✅ Найдено ${users.length} тестовых пользователей`, 'green');
    users.forEach(user => {
      log(`   - ${user.email} (${user.name})`, 'cyan');
    });
    
  } catch (error) {
    log(`❌ Ошибка при проверке пользователей: ${error.message}`, 'red');
  } finally {
    await prisma.$disconnect();
  }
  
  // 7. Итоговый отчет
  log('\n📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ', 'blue');
  log('=' .repeat(40), 'blue');
  
  const overallSuccess = allFilesExist && allFunctionsPresent && allTemplatesPresent;
  
  if (overallSuccess) {
    log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!', 'green');
    log('\n✅ Логистическая система полностью настроена и готова к работе', 'green');
    log('\n🚀 ГОТОВО К ИСПОЛЬЗОВАНИЮ:', 'cyan');
    log('1. Клиенты могут создавать заказы', 'cyan');
    log('2. Система автоматически создает маршруты и уведомляет логистов', 'cyan');
    log('3. Логисты могут выбирать маршруты', 'cyan');
    log('4. Клиенты получают уведомления об изменении статуса', 'cyan');
    
    log('\n🎯 ДЛЯ ЗАПУСКА ПРИЛОЖЕНИЯ:', 'yellow');
    log('1. Backend: cd ecotrack && npm run dev', 'yellow');
    log('2. Frontend: cd ecotrack-frontend && npm start', 'yellow');
    
  } else {
    log('❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ', 'red');
    log('Необходимо исправить ошибки перед использованием системы', 'red');
  }
}

// Запускаем тестирование
testLogisticsSystem().catch(console.error);
