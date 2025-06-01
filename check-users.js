// Скрипт для проверки и создания тестового пользователя
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndCreateUser() {
  try {
    console.log('Проверяем существующих пользователей...');
    
    // Проверяем существующих пользователей
    const users = await prisma.user.findMany();
    console.log('Найдено пользователей:', users.length);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Admin: ${user.isAdmin}`);
    });
    
    // Создаем тестового пользователя, если его нет
    const testEmail = 'test@example.com';
    let testUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!testUser) {
      console.log('\nСоздаем тестового пользователя...');
      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Тестовый пользователь',
          password: 'password123',
          isAdmin: false,
          companyName: 'Тестовая компания',
          inn: '1234567890',
          kpp: '123456789'
        }
      });
      console.log('✅ Тестовый пользователь создан:', testUser.email);
    } else {
      console.log('✅ Тестовый пользователь уже существует:', testUser.email);
    }
    
    // Создаем админа, если его нет
    const adminEmail = 'admin@example.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!adminUser) {
      console.log('\nСоздаем администратора...');
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Администратор',
          password: 'admin123',
          isAdmin: true,
          companyName: 'ХимкаПластик'
        }
      });
      console.log('✅ Администратор создан:', adminUser.email);
    } else {
      console.log('✅ Администратор уже существует:', adminUser.email);
    }
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUser();
