const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔄 Создаем тестовых пользователей для проверки логистической системы...\n');

  try {
    // Универсальный пароль для всех тестовых аккаунтов
    const testPassword = 'test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // 1. Создаем обычного клиента
    const client = await prisma.user.upsert({
      where: { email: 'client@test.com' },
      update: {},
      create: {
        email: 'client@test.com',
        password: hashedPassword,
        name: 'Тестовый Клиент',
        isAdmin: false,
        companyName: 'ООО Тест Клиент',
        inn: '1234567890',
        kpp: '123456789'
      }
    });

    // 2. Создаем логиста
    const logist1 = await prisma.user.upsert({
      where: { email: 'logist1@logistic.com' },
      update: {},
      create: {
        email: 'logist1@logistic.com',
        password: hashedPassword,
        name: 'Иван Логистов',
        isAdmin: false,
        companyName: 'ООО ХимкаПластик Логистика',
        inn: '9876543210',
        kpp: '987654321'
      }
    });

    // 3. Создаем второго логиста
    const logist2 = await prisma.user.upsert({
      where: { email: 'logist2@logistic.com' },
      update: {},
      create: {
        email: 'logist2@logistic.com',
        password: hashedPassword,
        name: 'Петр Маршрутов',
        isAdmin: false,
        companyName: 'ООО ХимкаПластик Логистика',
        inn: '5555555555',
        kpp: '555555555'
      }
    });

    // 4. Создаем менеджера
    const manager = await prisma.user.upsert({
      where: { email: 'manager@manager.com' },
      update: {},
      create: {
        email: 'manager@manager.com',
        password: hashedPassword,
        name: 'Анна Менеджерова',
        isAdmin: false,
        companyName: 'ООО ХимкаПластик',
        inn: '1111111111',
        kpp: '111111111'
      }
    });

    // 5. Создаем администратора
    const admin = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {},
      create: {
        email: 'admin@admin.com',
        password: hashedPassword,
        name: 'Супер Админ',
        isAdmin: true,
        companyName: 'ООО ХимкаПластик',
        inn: '0000000000',
        kpp: '000000000'
      }
    });

    console.log('✅ Тестовые пользователи созданы успешно!\n');
    
    console.log('📋 ДАННЫЕ ДЛЯ ВХОДА:');
    console.log('====================');
    console.log(`🔑 Универсальный пароль для всех аккаунтов: ${testPassword}\n`);
    
    console.log('👤 КЛИЕНТ (может создавать заказы):');
    console.log(`   Email: client@test.com`);
    console.log(`   Пароль: ${testPassword}`);
    console.log(`   Роль: Клиент\n`);
    
    console.log('🚚 ЛОГИСТ 1 (получает уведомления о новых заказах):');
    console.log(`   Email: logist1@logistic.com`);
    console.log(`   Пароль: ${testPassword}`);
    console.log(`   Роль: Логист\n`);
    
    console.log('🚛 ЛОГИСТ 2 (получает уведомления о новых заказах):');
    console.log(`   Email: logist2@logistic.com`);
    console.log(`   Пароль: ${testPassword}`);
    console.log(`   Роль: Логист\n`);
    
    console.log('👔 МЕНЕДЖЕР (управляет заказами):');
    console.log(`   Email: manager@manager.com`);
    console.log(`   Пароль: ${testPassword}`);
    console.log(`   Роль: Менеджер\n`);
    
    console.log('🔧 АДМИНИСТРАТОР (полный доступ):');
    console.log(`   Email: admin@admin.com`);
    console.log(`   Пароль: ${testPassword}`);
    console.log(`   Роль: Администратор\n`);

    console.log('🎯 ПЛАН ТЕСТИРОВАНИЯ:');
    console.log('===================');
    console.log('1. Войдите как клиент (client@test.com) и создайте заказ');
    console.log('2. Система автоматически отправит уведомления логистам');
    console.log('3. Войдите как логист (logist1@logistic.com) и проверьте новые заказы');
    console.log('4. Выберите маршрут для заказа');
    console.log('5. Система отправит уведомление клиенту об обновлении статуса');
    console.log('6. Войдите обратно как клиент и проверьте обновленный статус\n');

  } catch (error) {
    console.error('❌ Ошибка при создании пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
