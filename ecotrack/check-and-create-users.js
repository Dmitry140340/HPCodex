// Скрипт для проверки существующих пользователей
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Проверяем существующих пользователей...');
    
    // Проверяем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        companyName: true,
        createdAt: true
      }
    });
    
    console.log(`\nВсего найдено пользователей: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`👤 ${user.name}`);
      console.log(`🏢 ${user.companyName || 'Не указано'}`);
      console.log(`👑 Админ: ${user.isAdmin ? 'Да' : 'Нет'}`);
      console.log(`📅 Создан: ${user.createdAt.toLocaleString('ru-RU')}`);
      console.log('---');
    });

    // Ищем тестовых пользователей
    const testUser = users.find(u => u.email === 'test@himkaplastic.ru');
    const adminUser = users.find(u => u.email === 'admin@himkaplastic.ru');

    console.log('\n🔍 Статус тестовых пользователей:');
    console.log(`test@himkaplastic.ru: ${testUser ? '✅ Существует' : '❌ Не найден'}`);
    console.log(`admin@himkaplastic.ru: ${adminUser ? '✅ Существует' : '❌ Не найден'}`);

    if (!testUser || !adminUser) {
      console.log('\n🔧 Создаем недостающих тестовых пользователей...');
      
      if (!testUser) {
        const hashedPassword = await bcrypt.hash('123456', 12);
        await prisma.user.create({
          data: {
            email: 'test@himkaplastic.ru',
            name: 'Тестовый пользователь',
            password: hashedPassword,
            companyName: 'ООО Тест',
            isAdmin: false
          }
        });
        console.log('✅ Создан test@himkaplastic.ru с паролем: 123456');
      }

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await prisma.user.create({
          data: {
            email: 'admin@himkaplastic.ru',
            name: 'Администратор',
            password: hashedPassword,
            companyName: 'ХимкаПластик',
            isAdmin: true
          }
        });
        console.log('✅ Создан admin@himkaplastic.ru с паролем: admin123');
      }
    }

    console.log('\n🎯 Готовые учетные данные для тестирования:');
    console.log('Обычный пользователь: test@himkaplastic.ru / 123456');
    console.log('Администратор: admin@himkaplastic.ru / admin123');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
